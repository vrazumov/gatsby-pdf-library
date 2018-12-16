import React, { Component } from 'react';
import {Link, graphql} from 'gatsby';
import PDFJS from 'pdfjs-dist';
//import { Document, Page } from 'react-pdf/dist/entry.webpack';
//import { Document, Page } from 'react-pdf';
import classNames from 'classnames';

import * as styles from './ViewBook.css';

if (typeof window !== 'undefined') {
  //window.PDFJS = PDFJS;
  //window.PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

  //PDFJS.workerSrc = 'resources/js/pdfjs/pdf.worker.js';
}

export default class ViewBook extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: this.getInitialPageCount(),
      fullscreen: false,
      //file: 'sample.pdf',
      numPages: 2,
    };


    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.navigate = this.navigate.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }

  getInitialPageCount() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const fingerprint = this.props.data.book.fingerprint;
      return +window.localStorage.getItem(`currentPage:${fingerprint}`) || 1;
    }
  }

  storeCurrentPage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const fingerprint = this.props.data.book.fingerprint;
      window.localStorage.setItem(
        `currentPage:${fingerprint}`,
        this.state.page
      );
    }
  }

  toggleFullscreen() {
    this.setState({ fullscreen: !this.state.fullscreen });
  }

  nextPage() {
    const nextPage = (this.state.page += 1);

    if (nextPage < 1) {
      return;
    }

    this.setState({
      page: nextPage
    });
  }

  prevPage() {
    const nextPage = (this.state.page -= 1);

    if (this.state.page >= this.state.numPages) {
      return;
    }

    this.setState({
      page: nextPage
    });
  }

  navigate(event) {
    const bounds = event.target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const halfPoint = Math.floor(bounds.width / 2);

    if (x < halfPoint) {
      this.prevPage();
    } else {
      this.nextPage();
    }
  }

  componentDidMount() {
    
    //PDFJS.workerSrc = 'resources/js/pdfjs/pdf.worker.js';

    let pdfPath = this.props.data.book.downloadPath;

    PDFJS.getDocument(pdfPath).then(function(pdf) {
      // Do something with the PDF file stored in the `pdf` variable
      var numPages = pdf.numPages;
      this.state.numPages = numPages;
      console.log('# Document Loaded');
      console.log('Number of Pages: ' + numPages, this.state.page);
      this.pdf = pdf;
      this.renderPage();
    }.bind(this));

  }

  componentDidUpdate() {
    this.renderPage();
    this.storeCurrentPage();
  }

  renderPage() {
    this.pdf.getPage(this.state.page).then(function(page) {
      const scale = 1.5;
      const viewport = page.getViewport(scale);

      // Prepare canvas using PDF page dimensions
      const canvas = document.getElementById('book-canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      page.render(renderContext);
      
    });
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5",);
    this.setState({ numPages });
  }

  render() {
   const book = this.props.data.book;
    const bookViewClassnames = classNames('book-view', {
      fullscreen: this.state.fullscreen
    });

    const { numPages } = this.state;

    return (
      
      <div>
        <header className="book-headline">
          <h1 className="title">{book.title}</h1>
          <a href={book.downloadPath} className="download-link">
            &#9196;
          </a>
        </header>

        <Link className="back-link" to="/">
          Home
        </Link>

        <p className="author">Author: {book.author}</p>

        <section className={bookViewClassnames}>
          <div className="controls">
            <button onClick={this.prevPage} disabled={this.state.page <= 1}>
              Back
            </button>

            <p className="page-count">
              Page {this.state.page} of {book.pageCount}
            </p>

            <div className="controls-right">
              <button
                onClick={this.nextPage}
                disabled={this.state.page >= this.state.numPages }
              >
                Next {numPages}
              </button>

              <button onClick={this.toggleFullscreen}>
                {this.state.fullscreen ? '▼' : '▲'}
              </button>
            </div>
          </div>

          <canvas id="book-canvas" onClick={this.navigate} />
         
        </section>
      </div>
      
    );
  }
}

export const query = graphql`
  query BookQuery($path: String!) {
    book(path: { eq: $path }) {
      id
      title
      author
      pageCount
      downloadPath
      fingerprint
    }
  }
`;
