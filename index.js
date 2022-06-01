const express = require ('express');

const db = require('./connection/db')

const pg = require('pg');

const app = express();
const port = 4500;

const isLogin = true;
let projects = [
    {
        title: 'Photo Studio',
        startDate: '2022-05-24',
        endDate: '2022-06-24',
        duration: '1 Months',
        description: 'Photo Editors are in charge of coordinating photo assignments by selecting, editing, and positioning photos, and publishing images in print publications and on the web.',
        html: 'public/html.png',
        css: 'public/css.png',
        javascript: 'public/javascript.png',
        react: 'public/react.png',
        image: '1.webp',
        date : '24 May 2022 - 24 June 2022'
    },
];

// TEST CONNECTION DB
db.connect(function(err, _, done){
  if (err) throw err;

  console.log('Database Connection Success');
});
 
// PORT
app.listen(port, function () {
    console.log(`Server running on port: ${port}`);
});

// VIEW ENGINE
app.set('view engine', 'hbs');

app.use('/public', express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

pg.types.setTypeParser(1082, function(stringValue) {
  return stringValue; });
  
// ROUTING
app.get('/', function (req, res) {
    db.connect(function(err, client, done) {
      if (err) throw err;
    
    const query = 'SELECT * FROM tb_project';

    client.query(query, function (err, result){
      if (err) throw err;

    const projectsData = result.rows;

    const newProject = projectsData.map((project) => {
    project.isLogin = isLogin;
    project.duration = difference(project["startDate"], project["endDate"]);
    project.date = getFullTime(project["startDate"], project["startDate"]);
      return project;
    });

    console.log(newProject);

    res.render('index', {isLogin: isLogin, projects: newProject});
    });

    done();
  });
});

app.get('/home', function (req, res){
    db.connect(function(err, client, done) {
      if (err) throw err;
    
    const query = 'SELECT * FROM tb_project';

    client.query(query, function (err, result){
      if (err) throw err;

    const projectsData = result.rows;

    const newProject = projectsData.map((project) => {
    project.isLogin = isLogin;
    project.duration = difference(project["startDate"], project["endDate"]);
    project.date = getFullTime(project["startDate"], project["startDate"]);
      return project;
    });

    console.log(newProject);

      res.render('index', {isLogin: isLogin, projects: newProject});
    });

    done();
  });
})


app.get('/add-project', function (req, res){
    res.render('add-project');
});

app.post('/add-project', function (req, res){
    const data = req.body;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    
    console.log(data);

    db.connect(function(err, client, done) {
    if (err) throw err;
  
    const query = `INSERT INTO tb_project("startDate", "endDate", description, html, css, javascript, react, image, title)
                   VALUES ('${startDate}', '${endDate}', '${data.description}', '${data.html}', '${data.css}', '${data.javascript}', '${data.react}', '${data.image}', '${data.title}')`;

    client.query(query, function (err, result) {
    if (err) throw err;
  
    res.redirect('/');
    });

    done();
  });
});


app.get('/project-detail/:id', function (req, res){
  const id = req.params.id;

  db.connect(function(err, client, done) {
    if (err) throw err;
  
  const query = `SELECT * FROM tb_project WHERE id = ${id}`;

  client.query(query, function (err, result){
    if (err) throw err;
    
  
    const project = result.rows[0];
    const detail = project;  

    detail.duration = difference(detail["startDate"], detail["endDate"]);
    detail.date = getFullTime(detail["startDate"], detail["startDate"]);

    res.render('project-detail', {isLogin: isLogin, detail: detail})
    });
    done();
  });
})

app.get('/contact', function(req, res){
    res.render('contact', {isLogin: isLogin});
});

app.get('/edit-project/:id', function(req, res){
    let id = req.params.id;
    
    db.connect(function(err, client, done) {
      if (err) throw err;
    
    const query = `SELECT * FROM tb_project WHERE id = ${id}`;

    client.query(query, function (err, result){
      if (err) throw err;

    const edit = result.rows[0];

    res.render('edit-project', {isLogin: isLogin, edit, id})
    });
    done();
  });
});

app.post('/edit-project/:id', function(req, res){
    const data = req.body;
    const id = req.params.id;

    projects[id]=data;

    db.connect(function(err, client, done) {
      if (err) throw err;
    
      const query = `UPDATE tb_project
                     SET "startDate" = '${data.startDate}', "endDate" = '${data.endDate}', description = '${data.description}', 
                     html = '${data.html}', css = '${data.css}', javascript = '${data.javascript}', react = '${data.react}', 
                     image = '${data.image}', title = '${data.title}'
                     WHERE id = ${id}`;
  
      client.query(query, function (err, result) {
      if (err) throw err;
    
      res.redirect('/');
      });
  
      done();
    });
  });

app.get('/delete-project/:id', (req, res) => {
    const id = req.params.id;
   
    db.connect(function(err, client, done) {
      if (err) throw err;
    
      const query = `DELETE FROM tb_project WHERE id = ${id}`;
  
      client.query(query, function (err, result) {
      if (err) throw err;
    
      res.redirect('/');
      });
  
      done();
    });
  });

// TIME

const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  
  // DURATION DATE
  function getFullTime(startDate,endDate){
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    return `${startDate.getDate()} ${month[startDate.getMonth()]} ${startDate.getFullYear()} - ${endDate.getDate()} ${month[endDate.getMonth()]} ${endDate.getFullYear()}`;
  }

  // DURATION TIME
  function difference(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);
    const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
      day = 1000*60*60*24;
      dif =(date2utc - date1utc)/day;
    return dif < 30 ? dif +" Days" : parseInt(dif/30)+" Months"
  }
  
  
