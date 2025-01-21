import express from "express";
import Book from "../Models/Book.js";
import {faker} from "@faker-js/faker";
import jwt from "jsonwebtoken";

const router = express.Router();

router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', ['GET, POST, OPTIONS']);
    res.send();
})

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);

        //pagina min 1 keer limit skipt dus de producten die op de vorige pagina's staan
        const skippedItems = (page - 1) * limit;

        const books = await Book.find().limit(limit).skip(skippedItems);
        const totalItems = await Book.countDocuments(); //countDocuments telt alle items in de database

        const totalPages = Math.ceil(totalItems / limit) //Match.ceil rond af naar boven

        const jsonBooks = ({
            items: books,
            _links: {
                self: {
                    href: `${process.env.BASE_URL}/books`
                },
                collection: {
                    href: `${process.env.BASE_URL}/books`
                }
            },
            "pagination": {
                "currentPage": page,
                "currentItems": books.length,
                "totalPages": totalPages,
                "totalItems": totalItems,
                "_links": {
                    "first": {
                        "page": 1,
                        "href": `${process.env.BASE_URL}/books?page=1&limit=${limit}`
                    },
                    "last": {
                        "page": totalPages,
                        "href": `${process.env.BASE_URL}/books?page=${totalPages}&limit=${limit}`
                    },
                    "previous": null,
                    "next": {
                        "page": page+1,
                        "href": `${process.env.BASE_URL}/books?page=${page+1}&limit=${limit}`
                    }
                }
            }
        })

        res.status(200).json(jsonBooks);
    } catch(error) {
        res.json({error: error.message});
    }
});

router.post(`/`, async (req, res) => {
    try {
        const {title, description, author} = req.body;

        if (req.body.method === "SEED") {
            await Book.deleteMany({});
            const amount = req.body.amount;

            for (let i = 0; i < amount; i++) {
                await Book.create({
                    title: faker.book.title(),
                    description: faker.lorem.lines({ min: 1, max: 2}),
                    author: faker.book.author(),
                });

            }

            res.status(200).json({succes:true})
        } else {
            const book= await Book.create({
                title: title,
                description: description,
                author: author,
            });

            res.status(201).json(book)
        }



    } catch(error) {
        res.status(400).json({error: error.message});
    }
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', ['GET, PUT, DELETE, OPTIONS']);
    res.send();
})

router.get('/:id', async (req, res) => {
    const bookId = req.params.id;

    try {
        const books = await Book.findOne({_id:bookId});

        if(!books || books.length === 0) {
            res.status(404).json({ message: "this books does not exist"})
        } else {
            res.status(200).json(books);
        }
    } catch(error) {
        res.status(404).json({error: error.message});
    }
});

router.put('/:id', async (req, res) => {
    const bookId = req.params.id;
    const updatedData = req.body;

    if (!updatedData.title || updatedData.title === '') {
        return res.status(400).json({error: 'Title cannot be empty'});
    }
    if (!updatedData.description || updatedData.description === '') {
        return res.status(400).json({error: 'Description cannot be empty'});
    }
    if (!updatedData.author || updatedData.author === '') {
        return res.status(400).json({error: 'Author cannot be empty'});
    }

    try {
        const updatedBook = await Book.findByIdAndUpdate(bookId, updatedData, {
            new: true
        });

        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(400).json({error: error.message});    }
});

router.delete('/:id', async (req, res) => {
    const bookId = req.params.id;

    try {
        const deletedBook = await Book.findByIdAndDelete(bookId);
        if (!deletedBook) {
            return res.status(404).json({ error: 'Book not found'});
        }
        res.status(204).json({success: true, message: 'Book deleted!', deletedBook});
    } catch(error) {
        res.status(500).json({error: error.message});
    }
});

// const JWT_SECRET = process.env.JWT_SECRET;
// const USERNAME = "test123";
// const PASSWORD = "test123";
// router.post("/login", (req, res) => {
//
//     const authHeader = req.headers.authorization;
//     const base64Credentials = authHeader.split(" ")[1];
//     const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
//     const [username, password] = credentials.split(":");
//
//     try {
//         if (username !== USERNAME || password !== PASSWORD) {
//             return res.status(401).json({ error: "Invalid credentials" });
//         }
//
//         const token = jwt.sign(
//             {
//                 username: USERNAME,
//             },
//             JWT_SECRET,
//             { expiresIn: "1h" }
//         );
//
//         res.status(200).json({ message: "Login successful", token});
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


export default router;