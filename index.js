var readline = require('readline')
const fs = require('fs')

fs.truncate('index.html', 0, err => console.log(err))

rl = readline.createInterface({
    input: fs.createReadStream('ADDMARKDOWN.md'),
})

let pTagLines = []

function spliceLinkTagComponent(array, i, component) {
    if (!array[i]) {
        return
    }
    if (array[i][1] === component) {
        return;
    }
    if (array[i][1] != component) {
        array.splice(i, 1)
    }
    return spliceLinkTagComponent(array, i, component)
}

//Takes in a string, and splits it into an array of characters
//loops through to find square brackets and parens and saves in link tag components
//Last for loop makes sure that the last bracket and first parens are next to each other
//returns an array of arrays ['[', 20],[']',23],['(',24], [')',30]]
function verifyLinkTag(lines) {
    const linkTagComponents = []
    const charArray = lines.split('')
    const components = ['[', ']', '(', ')']

    for (let i = 0; i < charArray.length; i++) {
        for (let j = 0; j < components.length; j++) {
            if (charArray[i] === components[j]) {
                const componentInfo = [i, components[j]]
                linkTagComponents.push(componentInfo)
            }
        }
    }
    //Loop through Link tag components and makes sure we have brackets and parens in right order
    //[]()
    for (let i = 0; i < linkTagComponents.length; i++) {
        if (i === 0) {
            spliceLinkTagComponent(linkTagComponents, i, '[')
        }
        if (linkTagComponents[i] && linkTagComponents[i][1] === '[' && linkTagComponents[i + 1] && linkTagComponents[i + 1][1] != ']') {
            spliceLinkTagComponent(linkTagComponents, i + 1, ']')
        }
        if (linkTagComponents[i] && linkTagComponents[i][1] === ']' && linkTagComponents[i + 1] && linkTagComponents[i + 1][1] != '(') {
            spliceLinkTagComponent(linkTagComponents, i + 1, '(')
        }
        if (linkTagComponents[i] && linkTagComponents[i][1] === '(' && linkTagComponents[i + 1] && linkTagComponents[i + 1][1] != ')') {
            spliceLinkTagComponent(linkTagComponents, i + 1, ')')
        }
    }
    //make sure full image tag not []() [](
    const remainder = linkTagComponents.length % 4
    const index = linkTagComponents.length - remainder - 1
    linkTagComponents.splice(index, remainder)

    //invalid if []dh ()
    if (linkTagComponents.length >= 4) {
        for (let i = 1; i < linkTagComponents.length; i + 4) {
            const openBracket = linkTagComponents[i][1]
            const openBracketIndex = linkTagComponents[i][0]
            const expectedOpenParensIndex = openBracketIndex + 1
            const openParensIndex = linkTagComponents[i + 1][0]
            if (openBracket === ']' && expectedOpenParensIndex === openParensIndex) {
                return linkTagComponents
            }
            if (openBracket === ']' && expectedOpenParensIndex != openParensIndex) {
                linkTagComponents.splice(i - 1, 4)
            }
        }
    }
    return linkTagComponents
}

//Takes in LinkTagIndexArray, a string and tag type
//slices string inside []
//slices string inside ()
//slices string before[]
//slices string after()
//constructs the html
//adds html to file
function convertWithLinkTag(linkTagIndexArray, tagString, tag) {
    const linkText = tagString.slice(linkTagIndexArray[0][0] + 1, linkTagIndexArray[1][0])
    const link = tagString.slice(linkTagIndexArray[2][0] + 1, linkTagIndexArray[3][0])
    const textBefore = tagString.slice(0, linkTagIndexArray[0][0])
    const textAfter = tagString.slice(linkTagIndexArray[3][0] + 1, tagString.length)
    const linkTag = `<a src='${link}'>${linkText}</a>`
    let transformedString = `<${tag}> ${textBefore}${linkTag}${textAfter} </${tag}> \n`;
    if (textBefore === '' && textAfter === '') {
        transformedString = `${linkTag} \n`;
    }
    fs.appendFileSync('index.html', transformedString, { 'flags': 'a+' })
    return transformedString
}

//Takes in an array
//turns into string that is input for verifyLinkTag
//if not link tag, then add to file
//if link tag then run convertWithLinkTag
function convertParagraphTag(pTagLinesArray) {
    if (pTagLinesArray.length === 0) {
        return
    }
    if (pTagLinesArray.length > 0) {
        const pTagString = pTagLinesArray.join(' ')
        const linkTagIndexArray = verifyLinkTag(pTagString)
        if (linkTagIndexArray.length < 4) {
            fs.appendFileSync('index.html', `<p> ${pTagString} </p> \n`, { 'flags': 'a+' })
        } else {
            convertWithLinkTag(linkTagIndexArray, pTagString, 'p')
        }
        pTagLines = []
        return `<p> ${pTagString} </p>`
    }
}

//takes in an array
//removes first index, and turns into string
//passed to verifyLinkTag
//if no link tag then remove first index, turn to string and add to file
//if link tag then call convertWithLinkTag

function converterHeaderTag(inputArray) {
    const firstIndex = ['#', '##', '###', '####', '#####', '######']
    const inputString = inputArray.slice(1).join(' ')
    const linkTagIndexArray = verifyLinkTag(inputString)
    let htmlString;
    if (linkTagIndexArray < 4) {
        for (let i = 0; i < firstIndex.length; i++) {
            if (inputArray[0] === firstIndex[i]) {
                inputArray.splice(0, 1)
                let newString = inputArray.join(' ')
                htmlString = `<h${i + 1}> ${newString} </h${i + 1}> \n`;
                fs.appendFileSync('index.html', htmlString, { 'flags': 'a+' })
                return htmlString
            }
        }
    } else {
        const headerNumber = inputArray[0].length
        htmlString = convertWithLinkTag(linkTagIndexArray, inputString, `h${headerNumber}`)
        return htmlString
    }
    return htmlString
}

//readline for header, ..., '', everything else

rl.on('line', function (line) {
    let inputString = line.split(' ');
    if (inputString[0].charAt(0) === '#' && inputString[0].charAt(6) != '#') {
        convertParagraphTag(pTagLines)
        converterHeaderTag(inputString)
    } else if (inputString[0] === '...') {
        convertParagraphTag(pTagLines)
        fs.appendFileSync('index.html', '...\n', { 'flags': 'a+' })
    } else if (line === '') {
        convertParagraphTag(pTagLines)
    } else if (inputString[0] != '') {
        pTagLines.push(`${line}`)
    }
}).on('close', function () {
    convertParagraphTag(pTagLines)
    process.exit(0);
});


module.exports = {
    converterHeaderTag,
    convertParagraphTag,
    convertWithLinkTag,
    verifyLinkTag
}































