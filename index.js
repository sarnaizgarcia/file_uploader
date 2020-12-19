const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util')
const { cwd } = require('process');

const app = express();
const port = process.env.FILE_UPLOADER_PORT || 3500;
const basePath = process.env.FILE_UPLOADER_BASE_PATH || `${cwd()}/files`;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml'], limit:'100mb' }));

app.use('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
})

app.post ('/upload/:folder/:filename', async (req, res) => {
  const mkdir = promisify(fs.mkdir);
  const removeFile = promisify(fs.unlink);
  const pathDir = path.join(basePath, req.params.folder);
  const pathFile = path.join(pathDir, req.params.filename);

  try {
    if (!fs.existsSync(pathDir)) {
      await mkdir(pathDir);
    }

    if (fs.existsSync(pathFile)) {
      await removeFile(pathFile);
    }

    const file = fs.createWriteStream(pathFile);
    file.write(req.body, (error) => {
      if (error) {
        res.status(500).send(e.message);
      }
      res.status(200).send({ message: 'File uploaded' });
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.listen(port, () => {
  console.log('Server listen connection at port: ', port);
});