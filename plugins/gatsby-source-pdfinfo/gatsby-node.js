//
//
const { createFilePath } = require(`gatsby-source-filesystem`);
const PDFExtract = require('pdf.js-extract').PDFExtract;

/*
exports.sourceNodes = (
    { actions, createNodeId, createContentDigest },
    configOptions
  ) => {
    const { createNode } = actions
  
    // Gatsby adds a configOption that's not needed for this plugin, delete it
    delete configOptions.plugins
  
    // plugin code goes here...
    console.log("Testing my plugin", configOptions)
  }

const pdfjsLib = require('pdfjs-dist');
...
pdfjsLib.getDocument(pdfPath).then(function (doc) {
    var numPages = doc.numPages;
    console.log('# Document Loaded');
    console.log('Number of Pages: ' + numPages);
}

  */

const convertToJson = (pdfPath) =>
  new Promise((res, rej) => {
    const pdfExtract = new PDFExtract();

    pdfExtract.extract(
        pdfPath,
        {} /* options, currently nothing available*/,
        function(err, data) {
          if (err) {
            return console.log(err);
          }
  
          if (!data) {
            console.log("ERROR PDF EXTRACT");
            res(null);
          }
          res(data);
        }
    );

    /*  
            //const downloadPath = pdfPath.match(
            //  /(.*)\/src\/pages\/books\/(.*)/
            //)[2];

            //const fallbackName = downloadPath;    
            //metadata.downloadPath = `../../pdf/${downloadPath}`;
            /*
            metadata.title = data.meta.info.Title || fallbackName;
            metadata.author = data.meta.info.Author || 'Unknown';
            metadata.pageCount = (data.pdfInfo.numPages || 0).toString();
            metadata.fingerprint =
              data.pdfInfo.fingerprint || Math.random().toString();
              
      */
  })

async function onCreateNode({
  node,
  actions,
  getNode,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  
  // Filter out non-pdf content
  if (node.extension !== 'pdf') {
    return
  }

  const { createNode, createParentChildLink } = actions
  const path = createFilePath({ node, getNode, basePath: `pages` });
  const metadata = {};
  const pdfPath = node.absolutePath;

  //console.log("MEDIA TYPE", node.internal.mediaType)

  let data = await convertToJson(node.absolutePath)

  //console.log("PDF CONTENT >>>>>>>>\n", data);

  // /(.*)\/src\/pdf\/books\/(.*)/

  if (data.meta.info) {
    const downloadPath = pdfPath.match(
      /(.*)\/src\/pdf\/(.*)/
    )[2];

    //console.log("ZZZZZZZZZZ", downloadPath);

    const fallbackName = downloadPath.replace(/\.pdf$/, '');

    //console.log("XXXXXXX", fallbackName); 

    metadata.downloadPath = `../../pdf/${downloadPath}`;

    //console.log("CCCCCCC", metadata.downloadPath); 

    metadata.title = data.meta.info.Title || fallbackName;

    //console.log("TITLE", metadata.title); 
    
    metadata.author = data.meta.info.Author || 'Unknown';

    console.log("AUTHOR", metadata.author); 

    metadata.pageCount = '1'; //(data.pdfInfo.numPages || 0).toString();
    metadata.fingerprint = Math.random().toString();
      // data.pdfInfo.fingerprint || Math.random().toString();
  }


  const bookNode = {
    ...metadata,
    path: path.replace(/\s|\(|\)|\[|\]\<|>/g, '-'),
    id: createNodeId(`${node.id} >>> ${node.extension}`),
    children: [],
    parent: node.id,
    internal: {
      contentDigest: metadata.fingerprint,
      type: 'book'
    }
  };

  console.log("PATH", bookNode.path);
  console.log("ID", bookNode.id);
  console.log("PARENT", bookNode.parent);

  createNode(bookNode);
  createParentChildLink({ parent: node, child: bookNode });
}

exports.onCreateNode = onCreateNode

