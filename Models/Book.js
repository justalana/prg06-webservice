import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    author: {type: String, required: true},
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {

            ret._links = {
                self: {
                    href: `${process.env.BASE_URL}/books/${ret._id}`
                },
                collection: {
                    href: `${process.env.BASE_URL}/books`
                }
            }

            delete ret._id
            delete ret._v
        }

    }
});

export default mongoose.model('Book', bookSchema);