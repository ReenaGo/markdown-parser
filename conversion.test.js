const convert = require('./index.js')

test('convert string to header tag', async () => {
    const testArray = ['#', 'I', 'am', 'a', 'test']
    const data = await convert.converterHeaderTag(testArray)

    expect(data).toMatch('<h1> I am a test </h1>')
})

test('convert string to paragraph tag', async () => {
    const testArray = ['I', 'am', 'a', 'test']
    const data = await convert.convertParagraphTag(testArray)

    expect(data).toBe('<p> I am a test </p>')
})

test('verify link tag', async () => {
    const testArray = '[I am](a test)'
    const data = await convert.verifyLinkTag(testArray)

    expect(data).toEqual([[0, '['], [5, ']'], [6, '('], [13, ')']])
})

test('convert string to header tag', async () => {
    const testArray = ['#', 'I', 'am', 'a', 'test']
    const data = await convert.converterHeaderTag(testArray)

    expect(data).not.toBe('I am a test')
})

test('convert string to paragraph tag', async () => {
    const testArray = ['I', 'am', 'a', 'test']
    const data = await convert.convertParagraphTag(testArray)

    expect(data).not.toBe('I am a test')
})

test('verify link tag', async () => {
    const testArray = 'I [am](a test)'
    const data = await convert.verifyLinkTag(testArray)

    expect(data).not.toEqual([[0, '['], [5, ']'], [6, '('], [13, ')']])
})



