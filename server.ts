import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database
  let db = {
    users: [
      { id: "1", name: "Admin User", email: "admin@ilmgah.com", role: "admin", status: "active", joinedDate: "2023-01-01" },
      { id: "2", name: "John Doe", email: "john@student.com", role: "student", status: "active", borrowedCount: 2, reservationCount: 1, joinedDate: "2023-08-15" },
      { id: "3", name: "Jane Smith", email: "jane@student.com", role: "student", status: "active", borrowedCount: 0, reservationCount: 0, joinedDate: "2024-01-10" }
    ],
    books: [
      { id: "1", title: "The Muqaddimah", author: "Ibn Khaldun", isbn: "978-0691166285", category: "History", totalCopies: 5, availableCopies: 3, cover: "https://picsum.photos/seed/muqaddimah/150/225", description: "An introduction to history by the 14th-century Arab historian Ibn Khaldun." },
      { id: "2", title: "Principles of Jurisprudence", author: "Al-Shafi'i", isbn: "978-1905837137", category: "Law", totalCopies: 3, availableCopies: 0, cover: "https://picsum.photos/seed/law/150/225", description: "A seminal work on Islamic legal theory." },
      { id: "3", title: "The Book of Healing", author: "Ibn Sina", isbn: "978-1593338312", category: "Science", totalCopies: 8, availableCopies: 5, cover: "https://picsum.photos/seed/healing/150/225", description: "A scientific and philosophical encyclopedia by Avicenna." },
      { id: "4", title: "Algebraic Foundations", author: "Al-Khwarizmi", isbn: "978-1234567890", category: "Mathematics", totalCopies: 10, availableCopies: 10, cover: "https://picsum.photos/seed/algebra/150/225", description: "The foundation of modern algebra." },
      { id: "5", title: "Optics: Kitab al-Manazir", author: "Ibn al-Haytham", isbn: "978-0987654321", category: "Science", totalCopies: 4, availableCopies: 4, cover: "https://picsum.photos/seed/optics/150/225", description: "A seven-volume treatise on optics and other fields of study." }
    ],
    transactions: [
      { id: "1", bookId: "1", userId: "2", borrowDate: "2024-03-15", dueDate: "2024-03-29", status: "borrowed", fineAmount: 0 },
      { id: "2", bookId: "3", userId: "2", borrowDate: "2024-03-10", dueDate: "2024-03-24", status: "borrowed", fineAmount: 15.50 }
    ],
    reservations: [
      { id: "1", bookId: "2", userId: "2", reservationDate: "2024-03-20", status: "active", queuePosition: 1 }
    ],
    categories: ["History", "Law", "Science", "Mathematics", "Philosophy", "Literature"]
  };

  // API Routes
  app.get("/api/stats", (req, res) => {
    res.json({
      totalStudents: db.users.filter(u => u.role === "student").length,
      totalBooks: db.books.length,
      activeTransactions: db.transactions.filter(t => t.status === "borrowed").length,
      overdueBooks: db.transactions.filter(t => new Date(t.dueDate) < new Date() && t.status === "borrowed").length,
      pendingFines: db.transactions.reduce((acc, t) => acc + t.fineAmount, 0),
      availableBooks: db.books.reduce((acc, b) => acc + b.availableCopies, 0)
    });
  });

  // Books API
  app.get("/api/books", (req, res) => {
    res.json(db.books);
  });

  app.post("/api/books", (req, res) => {
    const newBook = { ...req.body, id: String(db.books.length + 1) };
    db.books.push(newBook);
    res.status(201).json(newBook);
  });

  app.put("/api/books/:id", (req, res) => {
    const index = db.books.findIndex(b => b.id === req.params.id);
    if (index !== -1) {
      db.books[index] = { ...db.books[index], ...req.body };
      res.json(db.books[index]);
    } else {
      res.status(404).send("Book not found");
    }
  });

  app.delete("/api/books/:id", (req, res) => {
    db.books = db.books.filter(b => b.id !== req.params.id);
    res.status(204).send();
  });

  // Users API
  app.get("/api/users", (req, res) => {
    res.json(db.users);
  });

  app.post("/api/users", (req, res) => {
    const newUser = { ...req.body, id: String(db.users.length + 1), joinedDate: new Date().toISOString().split('T')[0] };
    db.users.push(newUser);
    res.status(201).json(newUser);
  });

  // Transactions API
  app.get("/api/transactions", (req, res) => {
    const transactionsWithDetails = db.transactions.map(t => ({
      ...t,
      book: db.books.find(b => b.id === t.bookId),
      user: db.users.find(u => u.id === t.userId)
    }));
    res.json(transactionsWithDetails);
  });

  app.post("/api/borrow", (req, res) => {
    const { userId, bookId } = req.body;
    const book = db.books.find(b => b.id === bookId);
    const user = db.users.find(u => u.id === userId);

    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ error: "Book not available" });
    }

    const activeLoans = db.transactions.filter(t => t.userId === userId && t.status === "borrowed");
    if (activeLoans.length >= 5) {
      return res.status(400).json({ error: "Borrowing limit reached" });
    }

    const borrowDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newTransaction = {
      id: String(db.transactions.length + 1),
      bookId,
      userId,
      borrowDate,
      dueDate,
      status: "borrowed",
      fineAmount: 0
    };

    db.transactions.push(newTransaction);
    book.availableCopies -= 1;
    user.borrowedCount = (user.borrowedCount || 0) + 1;

    res.status(201).json(newTransaction);
  });

  app.post("/api/return/:id", (req, res) => {
    const transaction = db.transactions.find(t => t.id === req.params.id);
    if (!transaction || transaction.status !== "borrowed") {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transaction.status = "returned";
    const book = db.books.find(b => b.id === transaction.bookId);
    if (book) book.availableCopies += 1;

    const user = db.users.find(u => u.id === transaction.userId);
    if (user) user.borrowedCount -= 1;

    res.json(transaction);
  });

  // Reservations API
  app.get("/api/reservations", (req, res) => {
    const reservationsWithDetails = db.reservations.map(r => ({
      ...r,
      book: db.books.find(b => b.id === r.bookId),
      user: db.users.find(u => u.id === r.userId)
    }));
    res.json(reservationsWithDetails);
  });

  app.post("/api/reserve", (req, res) => {
    const { userId, bookId } = req.body;
    const book = db.books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const existingReservation = db.reservations.find(r => r.userId === userId && r.bookId === bookId && r.status === "active");
    if (existingReservation) return res.status(400).json({ error: "Already reserved" });

    const queuePosition = db.reservations.filter(r => r.bookId === bookId && r.status === "active").length + 1;

    const newReservation = {
      id: String(db.reservations.length + 1),
      bookId,
      userId,
      reservationDate: new Date().toISOString().split('T')[0],
      status: "active",
      queuePosition
    };

    db.reservations.push(newReservation);
    const user = db.users.find(u => u.id === userId);
    if (user) user.reservationCount = (user.reservationCount || 0) + 1;

    res.status(201).json(newReservation);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
