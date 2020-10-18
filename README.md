## Instructions
Add markdown text to ADDMARKDOWN.md, run index.js file using the command 'node index.js', find output in index.html file

1. conversion.test.js file contains tests
2. index.html contains output from running the program
3. index.js contains the program
4. ADDMARKDOWN.md contains markdown to be parsed

## Limitations
This implementation will not recognize a line if it begins with an indentation.
This implmentation is limited to only one a tag per line
Parser set up to parse only the below subset of markdown

# Heading 1                          <h1>Heading 1</h1>
## Heading 2                         <h2>Heading 2</h2>
...                                  ...                                          
###### Heading 6                     <h6>Heading 6</h6>
Unformatted text                     <p>Unformatted text</p>                      
[Link text](https://www.test.com)    <a href="https://www.test.com">Link text</a>




This implmentation is limited to only one 'a' tag per line


