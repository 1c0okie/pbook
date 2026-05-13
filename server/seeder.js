import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { categories } from './data/categories.js';
import { authors } from './data/authors.js';
import { books } from './data/books.js';
import { posts } from './data/posts.js';

import Category from './models/Category.js';
import Author from './models/Author.js';
import Book from './models/Book.js';
import Post from './models/Post.js';

import { connectDB } from './config/db.js';

dotenv.config();

const importData = async () => {
  try {
    await Book.deleteMany();
    await Category.deleteMany();
    await Author.deleteMany();
    await Post.deleteMany();

    const createdCategories = await Category.insertMany(categories);
    const createdAuthors = await Author.insertMany(authors);

    await Post.insertMany(posts);

    books[0].author = createdAuthors[0]._id;
    books[0].categories = [createdCategories[0]._id];

    books[1].author = createdAuthors[1]._id;
    books[1].categories = [createdCategories[1]._id];

    books[2].author = createdAuthors[2]._id;
    books[2].categories = [
      createdCategories[2]._id,
      createdCategories[0]._id
    ];

    const createdBooks = await Book.insertMany(books);

    for (const book of createdBooks) {
      await Author.findByIdAndUpdate(book.author, {
        $push: { books: book._id }
      });
    }

    console.log('Import success');

    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error(error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Book.deleteMany();
    await Category.deleteMany();
    await Author.deleteMany();
    await Post.deleteMany();

    console.log('Destroy success');

    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error(error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

const start = async () => {
  await connectDB();

  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    importData();
  }
};

start();