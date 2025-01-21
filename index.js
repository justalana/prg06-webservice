import express from 'express';
import mongoose from 'mongoose';
import books from './routes/books.js'

mongoose.connect('mongodb://127.0.0.1:27017/prg6');

const app = express();

app.use((req, res, next) => {

    if (req.method !== 'OPTIONS' && req.headers.accept !== 'application/json') {
        return res.status(406).json({error: 'Requests are only accepted with Accept of json'});
    }

    next();
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization')
    next();
})


app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/books', books)

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is listening on port ${process.env.EXPRESS_PORT}`);
});