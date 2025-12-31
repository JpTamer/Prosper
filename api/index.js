import cors from "cors";
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const app = express();

app.use(cors());
app.use(express.json());

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.get("/", (req, res)=>{
    res.json({ message: "Prosper API is running", version: "1.0.0" });
});

app.post("/register", async (req, res)=>{
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({error: "Please provide name, email, and password"});
    }
    
    try {
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
            console.log("Error querying user:", err);
            return res.status(500).json({error: "Database error"});
        }
        
        if(data.rows.length === 0){
            return res.status(401).json({error: "Invalid email or password"});
        }
        
        const user = data.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid){
            return res.status(401).json({error: "Invalid email or password"});
        }
        
        return res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});

app.post("/addtransactions", (req, res)=>{
    const {type, amount, category, date, account, user_id} = req.body;
    
    if(!type || !amount || !category || !date || !account || !user_id){
        return res.status(400).json({error: "All fields are required"});
    }
    
    const q = "INSERT INTO transactions (type, amount, category, date, account, user_id) VALUES ($1, $2, $3, $4, $5, $6)";
    db.query(q, [type, amount, category, date, account, user_id], (err, data)=>{
        if(err){
            console.log("Error inserting transaction:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.status(201).json({message: "Transaction added successfully"});
    });
});

app.get("/gettransactions/:userId", (req, res)=>{
    const userId = req.params.userId;
    
    const q = "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC";
    db.query(q, [userId], (err, data)=>{
        if(err){
            console.log("Error fetching transactions:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.json(data.rows);
    });
});

app.get("/getmonthlyhistory/:userId", (req, res)=>{
    const userId = req.params.userId;
    
    const q = `
        SELECT 
            TO_CHAR(date, 'YYYY-MM') as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions 
        WHERE user_id = $1
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month DESC
    `;
    
    db.query(q, [userId], (err, data)=>{
        if(err){
            console.log("Error fetching monthly history:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.json(data.rows);
    });
});

app.delete("/deletetransaction/:id", (req, res)=>{
    const transactionId = req.params.id;
    
    const q = "DELETE FROM transactions WHERE id = $1";
    db.query(q, [transactionId], (err, data)=>{
        if(err){
            console.log("Error deleting transaction:", err);
            return res.status(500).json({error: "Database error"});
        }
        return res.json({message: "Transaction deleted successfully"});
    });
});

// Export as serverless function for Vercel
export default (req, res) => {
    return app(req, res);
};
