import { Request, Response } from 'express';
import pool from '../conf/dbConnection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Funciones de ayuda para validar
const isValidId = (id: string): boolean => {
    const num = parseInt(id, 10);
    return !isNaN(num) && num > 0;
};

const isValidPrice = (price: any): boolean => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
};

// 1. Obtener todos (solo activos)
export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE active = TRUE');
        res.json(rows);
    } catch (error) {
        console.log("Error en getAll:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. Obtener por ID (solo activos)
export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            res.status(400).json({ error: 'ID inválido. Debe ser un entero positivo.' });
            return;
        }

        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ? AND active = TRUE', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
            return;
        }
        res.json(rows[0]);
    } catch (error) {
        console.log("Error en getById:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 3. Crear producto
export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, stock, description, brand, img } = req.body;
        
        if (!name || price === undefined || stock === undefined || !description) {
            res.status(400).json({ error: 'Faltan campos obligatorios (name, price, stock, description).' });
            return;
        }

        if (!isValidPrice(price)) {
            res.status(400).json({ error: 'El precio debe ser numérico y mayor a cero.' });
            return;
        }

        const query = `INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [name, price, stock, description, brand || null, img || null];

        const [result] = await pool.query<ResultSetHeader>(query, values);
        res.status(201).json({ message: 'Producto creado', id: result.insertId });
    } catch (error) {
        console.log("Error en create:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 4. Actualizar producto completo
export const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, price, stock, description, brand, img } = req.body;

        if (!isValidId(id) || !isValidPrice(price)) {
            res.status(400).json({ error: 'Datos inválidos en ID o precio.' });
            return;
        }

        // Verificar que exista y esté activo
        const [check] = await pool.query<RowDataPacket[]>('SELECT id FROM products WHERE id = ? AND active = TRUE', [id]);
        if (check.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
            return;
        }

        const query = `UPDATE products SET name=?, price=?, stock=?, description=?, brand=?, img=? WHERE id=?`;
        await pool.query(query, [name, price, stock, description, brand || null, img || null, id]);
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        console.log("Error en update:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 5. Baja lógica
export const logicalDelete = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            res.status(400).json({ error: 'ID inválido.' });
            return;
        }

        const [check] = await pool.query<RowDataPacket[]>('SELECT id FROM products WHERE id = ? AND active = TRUE', [id]);
        if (check.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
            return;
        }

        await pool.query('UPDATE products SET active = FALSE WHERE id = ?', [id]);
        res.json({ message: 'Producto dado de baja lógicamente' });
    } catch (error) {
        console.log("Error en logicalDelete:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 6. Cambiar precio
export const changePrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        if (!isValidId(id) || !isValidPrice(price)) {
            res.status(400).json({ error: 'Datos inválidos en ID o precio.' });
            return;
        }

        const [check] = await pool.query<RowDataPacket[]>('SELECT id FROM products WHERE id = ? AND active = TRUE', [id]);
        if (check.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
            return;
        }

        await pool.query('UPDATE products SET price = ? WHERE id = ?', [price, id]);
        res.json({ message: 'Precio actualizado correctamente' });
    } catch (error) {
        console.log("Error en changePrice:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};