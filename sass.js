const sass = require("sass");
const fs = require("fs");
const postcss = require("postcss");
const readdir = require("recursive-readdir");
const autoprefixer = require("autoprefixer");

let watch = [
  "source/sass/main.sass"
];

function render(input, output){
  console.log(`Compiling ${input}`);
  try{
    let css = sass.renderSync({
      file: input
    }).css.toString("utf-8");

    css = postcss([autoprefixer({
      browsers: [
        "> 0%",
        "last 10000 versions"
      ]
    })]).process(css).css;

    fs.writeFileSync(output, css);
  } catch(e){
    console.error(e);
  }
}

readdir("source/sass")
.then(files => {
  return files.concat(watch);
})
.then(files => {
  files.forEach(file => {
    fs.watch(file, build);
  });
});

function build(){
  console.log("\n\nCompiling build...");
  let files = watch;

  files.forEach(file => {
    let output = file.match(/[^\/]*?\.sass/gmi)[0];
    output = output.substr(0, output.length - 5);
    output = `public/css/${output}.css`;
    render(file, output);
  });
}

build();
