import cors from "cors";
import express, { request } from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
const app = express();
dotenv.config({path:'./.env'});
app.listen(3000, '0.0.0.0', ()=>{
    console.log("connected to the backend on port 3000")
});

app.use(cors());
app.use(express.json());

const db = new Pool({
    connectionString: process.env.DATABASE_URL ,
});

db.connect((err) => {
    if(err){
        console.log("Error connecting to database:", err);
        return;
    }
    console.log("Connected to Neon PostgreSQL database");
});

app.get("/", (req, res)=>{
    res.json("Hello this is the backend");
});

app.post("/register", async (req, res)=>{
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({error: "Please provide name, email, and password"});
    }
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const q = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)";
        db.query(q, [name, email, hashedPassword], (err, data)=>{
            if(err){
                console.log("Error inserting user:", err);
                return res.status(500).json({error: "Database error"});
            }
            return res.status(201).json({
                message: "User registered successfully",
              
            });
        });
    } catch (error) {
        console.log("Error hashing password:", error);
        return res.status(500).json({error: "Server error"});
    }
});

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: "Please provide email and password"});
    }
    
    const q = "SELECT * FROM users WHERE email = $1";
    db.query(q, [email], async (err, data)=>{
        if(err){
            console.log("Error fetching user:", err);
            return res.status(500).json({error: "Database error"});
        }
        if(data.rows.length === 0){
            return res.status(401).json({error: "Invalid email or password"});
        }
        
        try {
            // Compare the provided password with the hashed password
            const isPasswordValid = await bcrypt.compare(password, data.rows[0].password);
            
            if(!isPasswordValid){
                return res.status(401).json({error: "Invalid email or password"});
            }
            
            return res.status(200).json({
                message: "Login successful",
                token: "dummy-token",
                userId: data.rows[0].id,
                name: data.rows[0].name
            });
        } catch (error) {
            console.log("Error comparing passwords:", error);
            return res.status(500).json({error: "Server error"});
        }
    });
});

// Get all transactions for a user
app.get("/transactions/:userId", (req, res) => {
    const { userId } = req.params;
    
    const q = "SELECT * FROM transactions WHERE user_id = $1 ORDER BY datetime DESC";
    db.query(q, [userId], (err, data) => {
        if(err){
            console.log("Error fetching transactions:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.status(200).json(data.rows);
    });
});

// Add a new transaction
app.post("/transactions", (req, res) => {
    const { userId, description, amount, type, datetime } = req.body;
    
    if(!userId || !description || !amount || !type || !datetime){
        return res.status(400).json({error: "Please provide all required fields"});
    }
    
    const q = "INSERT INTO transactions (user_id, description, amount, type, datetime) VALUES ($1, $2, $3, $4, $5) RETURNING id";
    db.query(q, [userId, description, amount, type, datetime], (err, data) => {
        if(err){
            console.log("Error adding transaction:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.status(201).json({
            message: "Transaction added successfully",
            transactionId: data.rows[0].id
        });
    });
});

// Delete a transaction
app.delete("/transactions/:id", (req, res) => {
    const { id } = req.params;
    
    const q = "DELETE FROM transactions WHERE id = $1";
    db.query(q, [id], (err, data) => {
        if(err){
            console.log("Error deleting transaction:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.status(200).json({message: "Transaction deleted successfully"});
    });
});

// Get user's financial summary
app.get("/summary/:userId", (req, res) => {
    const { userId } = req.params;
    
    const q = `
        SELECT 
            SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as total_expenses,
            SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END) as total_balance
        FROM transactions 
        WHERE user_id = $1
    `;
    
    db.query(q, [userId], (err, data) => {
        if(err){
            console.log("Error fetching summary:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.status(200).json({
            income: data.rows[0].total_income || 0,
            expenses: data.rows[0].total_expenses || 0,
            balance: data.rows[0].total_balance || 0
        });
    });
});

// End month - Archive current transactions and clear them
app.post("/end-month/:userId", (req, res) => {
    const { userId } = req.params;
    
    // First, get the current month's summary
    const summaryQuery = `
        SELECT 
            SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as total_expenses,
            SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END) as total_balance
        FROM transactions 
        WHERE user_id = $1
    `;
    
    db.query(summaryQuery, [userId], (err, summaryData) => {
        if(err){
            console.log("Error fetching summary:", err);
            return res.status(500).json({error: "Database error"});
        }
        
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();
        
        // Insert into monthly history
        const insertQuery = "INSERT INTO monthly_history (user_id, month, year, total_income, total_expenses, balance) VALUES ($1, $2, $3, $4, $5, $6)";
        db.query(insertQuery, [userId, month, year, 
                              summaryData.rows[0].total_income || 0, 
                              summaryData.rows[0].total_expenses || 0, 
                              summaryData.rows[0].total_balance || 0], (err, data) => {
            if(err){
                console.log("Error saving monthly history:", err);
                return res.status(500).json({error: "Database error"});
            }
            
            // Delete all transactions for this user
            const deleteQuery = "DELETE FROM transactions WHERE user_id = $1";
            db.query(deleteQuery, [userId], (err, data) => {
                if(err){
                    console.log("Error clearing transactions:", err);
                    return res.status(500).json({error: "Database error"});
                }
                return res.status(200).json({
                    message: "Month ended successfully",
                    archived: {
                        month: month,
                        year: year,
                        income: summaryData.rows[0].total_income || 0,
                        expenses: summaryData.rows[0].total_expenses || 0,
                        balance: summaryData.rows[0].total_balance || 0
                    }
                });
            });
        });
    });
});

// Get monthly history
app.get("/monthly-history/:userId", (req, res) => {
    const { userId } = req.params;
    
    const q = "SELECT * FROM monthly_history WHERE user_id = $1 ORDER BY year DESC, id DESC";
    db.query(q, [userId], (err, data) => {
        if(err){
            console.log("Error fetching monthly history:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.status(200).json(data.rows);
    });
    });
