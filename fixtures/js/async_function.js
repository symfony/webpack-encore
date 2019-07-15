async function foo() {
    console.log('foo');
}

foo().then(() => {
    console.log('bar');
});
