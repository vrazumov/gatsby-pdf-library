/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const path = require("path")
const { createFilePath, createFileNode } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions;
  
    return new Promise((resolve, reject) => {
      const viewBook = path.resolve('./src/templates/view-book.js');
      resolve(
        graphql(
          `
            {
              allBook(limit: 1000) {
                edges {
                  node {
                    path
                  }
                }
              }
            }
          `
        ).then(result => {
          if (result.errors) {
            console.log(result.errors);
            reject(result.errors);
          }
  
          // Create blog posts pages.
          result.data.allBook.edges.forEach(edge => {
            createPage({
              path: edge.node.path,
              component: viewBook,
              context: {
                path: edge.node.path
              }
            });
          });
        })
      );
    });
  };


exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    //
    if (node.internal.type === `book`) {
        console.log("\n ON CREATE NODE +++>>>");
        const slug = createFilePath({ node, getNode, basePath: `pages` })
        console.log("SLUG", slug);
        createNodeField({
            node,
            name: `slug`,
            value: slug,
        })

    }
}