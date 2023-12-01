/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const { MongoClient, ObjectId } = require('mongodb');

/**
 * @param {string} id
 * @returns {ObjectId|null}
 */
function createObjectID(id) {
    try {
        return new ObjectId(id);
    } catch (err) {
        return null;
    }
}

const defaultBook = {
    title: "Aizistral's Guide to the Galaxy",
    comments: [],
    comment_count: 0
};

module.exports = async function (app) {
    const client = new MongoClient(process.env.DB);

    try {
        console.log("Connecting to database...");
        await client.connect();
    } catch (err) {
        console.log("Error connecting to database", err);
        throw err;
    }

    const database = client.db('test').collection('personal-library');
    await database.drop(); // Drop collection on each restart
    await database.insertOne(defaultBook); // Insert default book for testing

    console.log("Database connection successful.");

    app.route('/api/books')
        .get(async function (req, res) {
            //response will be array of book objects
            //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

            try {
                const books = await database.find({}).toArray();

                return res.status(200).send(books.map(book => {
                    return {
                        _id: book._id,
                        title: book.title,
                        commentcount: book.comment_count
                    }
                }));
            } catch (err) {
                return res.status(500).send('Database error');
            }
        })

        .post(async function (req, res) {
            const title = req.body.title;

            if (!title)
                return res.status(200).send('missing required field title');

            try {
                const exBook = await database.findOne({ title });
                if (exBook) return res.status(200).send({ _id: exBook._id, title: exBook.title });

                console.log('Creating new book:', title);

                const book = {
                    title,
                    comments: [],
                    comment_count: 0
                };

                const result = await database.insertOne(book);

                return res.status(200).send({
                    _id: result.insertedId,
                    title: book.title
                });
            } catch (err) {
                return res.status(500).send('Database error');
            }
        })

        .delete(async function (req, res) {
            //if successful response will be 'complete delete successful'

            try {
                await database.deleteMany();
                return res.status(200).send('complete delete successful');
            } catch (err) {
                return res.status(500).send('Database error');
            }
        });



    app.route('/api/books/:id')
        .get(async function (req, res) {
            const bookid = req.params.id;
            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

            try {
                const book = await database.findOne({ _id: createObjectID(bookid) });
                if (!book) return res.status(200).send('no book exists');

                return res.status(200).send({
                    _id: book._id,
                    title: book.title,
                    comments: book.comments
                });
            } catch (err) {
                return res.status(500).send('Database error');
            }
        })

        .post(async function (req, res) {
            const bookid = req.params.id;
            const comment = req.body.comment;
            //json res format same as .get

            if (!comment) return res.status(200).send('missing required field comment');

            try {
                const book = await database.findOne({ _id: createObjectID(bookid) });
                if (!book) return res.status(200).send('no book exists');

                book.comments.push(comment);
                book.comment_count = book.comments.length;

                const result = await database.updateOne({ _id: createObjectID(bookid) }, {
                    $set: {
                        comments: book.comments,
                        comment_count: book.comment_count
                    }
                });

                if (result.modifiedCount === 0) return res.status(200).send('no book exists');

                return res.status(200).send({
                    _id: book._id,
                    title: book.title,
                    comments: book.comments
                });
            } catch (err) {
                return res.status(500).send('Database error');
            }
        })

        .delete(async function (req, res) {
            const bookid = req.params.id;
            //if successful response will be 'delete successful'

            try {
                const result = await database.deleteOne({ _id: createObjectID(bookid) });
                if (result.deletedCount === 0) return res.status(200).send('no book exists');

                return res.status(200).send('delete successful');
            } catch (err) {
                return res.status(500).send('Database error');
            }
        });

};
