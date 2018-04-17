const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
var bcrypt = require('bcrypt');

const mysql = require('mysql');
const connection = mysql.createConnection(require('../routes/connection.json'));

chai.should();
chai.use(chaiHttp);

const agent = chai.request.agent(server);

describe('Section Management', () => {
   let studentCookie;
   let adminCookie;
   let defaultAdminCookie;

   before('create an admin and student user account', (done) => {
      connection.connect(function (err) {
         if (err)
            throw new Error('Unable to connect to database!');
      });

      let adminUser = {
         'firstName': 'Jake',
         'lastName': 'Admin',
         'email': 'Jake@admin.com',
         'role': 1,
         'passHash': bcrypt.hashSync('password', 10),
         'termsAccepted': new Date()
      };

      let studentUser = {
         'firstName': 'Jake',
         'lastName': 'Student',
         'email': 'jake@student.com',
         'role': 0,
         'passHash': bcrypt.hashSync('password', 10),
         'termsAccepted': new Date()
      };

      connection.query('insert into User set ?', adminUser);
      connection.query('insert into User set ?', studentUser, function() {
         done();
      });
   });

   after('remove Users and reset auto_increment', (done) => {
      let defaultAdmin = {
         'firstName': 'Joe',
         'lastName': 'Admin',
         'email': 'admin@example.com',
         'role': 1,
         'passHash': '$2a$10$Nq2f5SyrbQL2R0e9E.cU2OSjqqORgnwwsY1vBvVhV.SGlfzpfYvyi',
         'termsAccepted': new Date()
      };

      connection.query('delete from User');
      connection.query('alter table User auto_increment=1');
      connection.query('insert into User set ?', defaultAdmin, function (err) {
         if (err) throw err;

         done();
      });
   });


   describe('Log in as a student', () => {
      it('results in a POST for a new session', (done) => {
         let session = {
            'email': 'jake@student.com',
            'password': 'password'
         };

         agent
            .post('/Session')
            .send(session)
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.empty;
               res.should.have.cookie('SPAuth');

               // save cookie for getting Session by cookie
               studentCookie = res.header.location.replace('/Session/', '');

               done();
            });
      });
   });

   describe('/GET 0 sections', () => {
      it('results in 200 and empty array', (done) => {
         
         chai.request(server)
            .get('/Section')
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('array');
               res.body.should.have.lengthOf(0);
               done();
            });
      });
   });

   describe('/POST section as a non-admin', () => {
      it('results in 401', (done) => {
         
         let sectionData = {
            'name': 'CSC101',
            'description': 'Introduction to Computer Science',
            'term': 'S18'
         }

         agent
            .post('/Section')
            .send(sectionData)
            .end((err, res) => {
               res.should.have.status(401);
               res.body.should.be.a('array');
               res.body.should.have.lengthOf(0);
               done();
            });
      });
   });

   describe('/POST section as an admin', () => {
      it('Logs in as admin', (done) => {
         let session = {
            'email': 'jake@admin.com',
            'password': 'password'
         };

         agent
            .post('/Session')
            .send(session)
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.empty;
               res.should.have.cookie('SPAuth');

               // save cookie for getting Session by cookie
               studentCookie = res.header.location.replace('/Session/', '');

               done();
            });
      });

      it('results in successful section CSC102 creation', (done) => {
         
         let sectionData = {
            'name': 'CSC102',
            'description': 'Introduction to Computer Science 2',
            'term': 'S18'
         }

         agent
            .post('/Section')
            .send(sectionData)
            .end((err, res) => {
               res.should.have.status(200);
               done();
            });
      });
   });

   describe('/POST 2nd section CSC103 as an admin', () => {
      it('results in successful section creation', (done) => {
         
         let sectionData = {
            'name': 'CSC103',
            'description': 'Introduction to Computer Science 3',
            'term': 'S18'
         }

         agent
            .post('/Section')
            .send(sectionData)
            .end((err, res) => {
               res.should.have.status(200);
               done();
            });
      });
   });

   describe('/GET 2 sections', () => {
      it('results in 200 and 2 sections returned', (done) => {
         agent
            .get('/Section')
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('array');
               res.body.should.have.lengthOf(2);
               res.body[0].should.have.property('term', 'S18');
               done();
            });
      });
   });

   describe('/GET section specified by term', () => {
      it('results in 200 and sections in S18', (done) => {
         agent
            .get('/Section')
            .query({'term': 'S18'})
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('array');
               res.body.should.have.lengthOf(2);
               res.body[0].should.have.property('term', 'S18');
               done();
            });
      });
   });

   describe('/GET section specified by name', () => {
      it('results in 200 and CSC101 section returned', (done) => {
         agent
            .get('/Section')
            .query({'name': 'CSC102'})
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('array');
               res.body.should.have.lengthOf(1);
               res.body[0].should.have.property('name', 'CSC102');
               done();
            });
      });
   });







   describe('/GET /section/2', () => {
      it('results in 200 and returns section with id = 2', (done) => {
         agent
            .get('/Section/2')
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.have.lengthOf(1);
               res.body.should.have.property('id', 2);
               res.body.should.have.property('name', 'CSC103');
               done();
            });
      });
   });

   describe('/PUT update /section/:id', () => {
      it('results in 200 and updates name of section 1', (done) => {

         let sectionUpdateInfo = {
            'name': 'CSC201',
            'description': 'Introduction to Computer Science is now CSC201'
         }

         agent
            .put('/Section/1')
            .end((err, res) => {
               res.should.have.status(200);
               done();
            });
      });
   });

   describe('/GET /section/1', () => {
      it('results in 200 and confirms the updates to section 1', (done) => {
         agent
            .get('/Section/1')
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.have.lengthOf(1);
               res.body.should.have.property('id', 1);
               res.body.should.have.property('name', 'CSC201')
               res.body.should.have.property('description', 'Introduction to Computer Science is now CSC201');
               done();
            });
      });
   });

   describe('/DELETE /section/1', () => {
      it('results in 200 and deletes section 1', (done) => {
         agent
            .delete('/Section/1')
            .end((err, res) => {
               res.should.have.status(200);
               done();
            });
      });
   });

   describe('/GET 1 section', () => {
      it('results in 200 and 1 section returned', (done) => {
         agent
            .get('/Section')
            .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('array');
               res.body.should.have.lengthOf(1);
               res.body[0].should.have.property('id', 2);
               done();
            });
      });
   });

   describe('/GET /section/1 will not work', () => {
      it('results in 404 because section was deleted', (done) => {
         agent
            .get('/Section/1')
            .end((err, res) => {
               res.should.have.status(404);
               
               done();
            });
      });
   });


});