const classArr = {};
const getClasses = async() => {
    const classList = [
        'Class1',
        'Class2',
        'Class3'
    ];
    const path = './classes/';
    for (let className of classList) {
        const classPath = `${path}${className}.js`;
        const currModule = await import(classPath);
        classArr[className] = new currModule[className]
    }
}

await getClasses();

for (let madeClass of Object.values(classArr)) {
    madeClass.pre();
    madeClass.pixel();
}
// could make a class of visualisers https://stackoverflow.com/questions/52377344/javascript-array-of-instances-of-a-class