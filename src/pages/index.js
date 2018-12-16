import React from 'react'
import { Link, graphql} from 'gatsby'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'

const IndexPage = (props) => {
  //const booksList = ""; //props.data.allBooks;
  const searchQuery = '';
  const { allBook } = props.data;
  const books = allBook.edges.filter(book => {
    //const regex = new RegExp(`.*${this.state.searchQuery}.*`, 'i');
    const regex = new RegExp(`.*${searchQuery}.*`, 'i');
    return book.node.title.match(regex);
  });

  console.log("BOOKS", books);

  return(
  <Layout>
    <SEO title="Home" keywords={['gatsby', 'application', 'react']} />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: '300px', marginBottom: '1.45rem' }}>
      <Image />
    </div>
    <Link to="/page-2/">Go to page 2</Link>
    {books.map(({ node }) => (
          <div key={node.id} className="book">
            <Link className="book-link" to={node.path}>
              <h3>{node.title}</h3>
            </Link>

            <div className="book-info">
              <span className="info">{node.author}</span>

              {node.pageCount && (
                <span className="info">{node.pageCount} pages</span>
              )}
            </div>
          </div>))
      }
  </Layout>
)
  }

export default IndexPage

export const query = graphql`
  query IndexQuery {
    allBook(sort: { fields: [title] }) {
      totalCount
      edges {
        node {
          id
          title
          author
          pageCount
          path
        }
      }
    }
  }
`;
