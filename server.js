const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const db = require('./data/db.js');

const server = express();

server.use(morgan('dev'));
server.use(helmet());
server.use(express.json());
server.use(cors());


server.post('/api/posts', (req, res) => {
    const body = req.body ? req.body : {}
   
    const { title, contents } = body

    if(!title || !contents) {
        res.status(400).json({errorMessage: "Please provide title and contents for the post."})
        return;
    }

    const newPost = {
        title,
        contents,
    }

    db
        .insert(newPost)
        .then(id => {
            const post = {...newPost, id}
            res.status(201).json(post);
        })
        .catch(error => {
            res.status(500).json({ error: "There was an error while saving the post to the database" });
        });
    //res.json({ a: 1});
});

server.get('/api/posts', (req, res) => {
    db
        .find()
        .then(posts => {
            res.json(posts);
        })
        .catch(error => {
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});


server.get('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    
    db
        .findById(id)
        .then(posts => {
            if(posts.length === 0) {
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        }
        else {
            res.json(posts);
        }
    })
        .catch(error => {
            res.status(500).json({ error: "The post with the specified ID does not exist." });
    })
});

server.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    let post;

    db
            .remove(id)
            .then(deletes => {
                if(deletes === 0) {
                    res.error(404).json({ message: "The post with the specified ID does not exist." })
                }
                else{
                    res.status(200).json({ message: "Post deleted." })
                }
            })
            .catch(error => {
                res.status(500).json({ error: "The post could not be removed" })
        })
});

server.put('/api/posts/:id', (req, res) => {
    const { id } = req.params
    const { title, contents } = req.body;
    
    if(title === undefined || contents === undefined) {
        res.error(400).json({ errorMessage: "Please provide title and contents for the post." })
    }
    else{
        const newPost = { 
            title, 
            contents
        }
    
    db
        .update(id, newPost)
        .then(inserts => {
            if(inserts === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            }
            else{
                res.status(200).json({ message: "Updated ok." })
            }
        }
        )
        .catch(error => {
            res.status(500).json({ error: "The post information could not be modified." })
        })
    }
});



const port = 5000;
server.listen(port, () => console.log('API Running on port 5000'));
