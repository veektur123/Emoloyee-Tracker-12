const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
    host: 'localhost',
    // MySQL username,
    user:'root',
    // MySQL password
    password:'Vatl1993',
    database:'employee_tracker_db'
    },
 console.log(`Connected to the employee_tracker_db database.`) 
 );

const initialQuestion = [
    {
        type: 'list',
        name: 'initialAnswer',
        message: 'What would you like to do?', 
        choices:["Update Employee Role", "View All Roles","Add Role","View All Departments","Add Department","View All Employees","Add An Employee","Quit",]
    },

]

const initialPrompt = async () => {
    let {initialAnswer} = await inquirer.prompt(initialQuestion); console.log(initialAnswer)
    switch (initialAnswer) {
        case "Update Employee Role":
            updateEmployee()
            break;
        case "View All Roles":
            viewAllRoles()
            break;
        case "Add Role":
            addRole()
            break;
        case "View All Departments":
            viewAllDepartments()
            break;
        case "Add Department": 
        addDepartment()
            break;
        case "View All Employees":
            viewAllEmployees()
            break;
        case "Add An Employee":
        addEmployee()
            break;
        case "Quit":
            quit()
            break;
        default:
            return;
    }
}

initialPrompt()

const addDepartment= async ()=>{
    const departmentQuestion = [
        {
            type: 'input',
            name: 'departmentName',
            message: 'What would you like to name this department?', 
        },
    
    ]
    let {departmentName} = await inquirer.prompt(departmentQuestion);
    // simple query
db.query(
    `INSERT INTO department (name) VALUES ('${departmentName}');`,
    function(err,) {
        if (err) {
        console.log("Error inserting department")  
        console.log(err)  
         }
         else {console.log("Everything was successful.")}
    }
  );
  initialPrompt()
}


const addEmployee = async () => {
    db.query('SELECT * FROM role', async (err, roleRows) => {
        if (err) {
            console.log("Error retrieving roles.")  
            console.log(err)  
        }
        else {
            if(!roleRows.length) {
                console.log('No role found. Add one before adding a employee.')
                return initialPrompt()
            }
            const roleNames = roleRows.map(role => role.name)

            db.query('SELECT * from employee;', async (employeeErr, employeeRows) => {
                if (employeeErr) {
                    console.log("Error retrieving employees.")  
                    console.log(employeeErr)  
                } else {
                    if(!roleRows.length) {
                        console.log('No role found. Add one before adding a employee.')
                        return initialPrompt()
                    } else {
                        const managerNames = employeeRows.map(employee => `${employee.first_name} ${employee.last_name}`)
                        const employeeQuestion = [
                            {
                                type: 'input',
                                name: 'employeeFirstName',
                                message: 'Please enter employees first name.',
                            },
                            {
                                type: 'input',
                                name: 'employeeLastName',
                                message: 'Please enter employees last name.',
                            },
                            {
                                type: 'list',
                                name: 'employeeRoleName',
                                message: 'What is this employees role?', 
                                choices: roleNames
                            },
                            {
                                type: 'list',
                                name: 'employeeManagerName',
                                message: `Who is this employee's manager?`,
                                when: () => {
                                    return managerNames.length > 0
                                },
                                choices: managerNames
                            }, 
                        ]

                        let {employeeFirstName,employeeLastName,employeeRoleName, employeeManagerName} = await inquirer.prompt(employeeQuestion);
                        const foundRole = roleRows.find(role => role.name === employeeRoleName)
                        const roleId = foundRole.id

                        if(employeeManagerName) {
                            const [managerFirstName, managerLastName] = employeeManagerName.split(' ')
                            const foundManager = employeeRows.find(employee => {
                                return employee.first_name === managerFirstName && employee.last_name === managerLastName
                            })
                            const managerId = foundManager.id

                            db.query(
                                `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${employeeFirstName}','${employeeLastName}','${roleId}','${managerId}'); `,
                                function(err,) {
                                    if (err) {
                                        console.log("Error inserting employee.")  
                                        console.log(err)  
                                    }
                                    else {
                                        console.log("Successfully inserted employee.")
                                    }
                                    initialPrompt()
                                } 
                            )
                        } else {
                            db.query(
                                `INSERT INTO employee (first_name, last_name, role_id) VALUES ('${employeeFirstName}','${employeeLastName}','${roleId}'); `,
                                function(err,) {
                                    if (err) {
                                        console.log("Error inserting employee.")  
                                        console.log(err)  
                                    }
                                    else {
                                        console.log("Successfully inserted employee.")
                                    }
                                    initialPrompt()
                                } 
                            ) 
                        }
                    }
                }
            })
        }
    })
}

const addRole = async () => { 
     db.query(`SELECT * FROM department;`, async function(err, rows) {
        if (err) {
            console.log("Error retrieving departments")  
            console.log(err)  
        }
        else {
            if(!rows.length) {
                console.log('No departments found. Add one before adding a role.')
                return initialPrompt()
            }
            const departmentNames = rows.map(department => department.name)

            const roleQuestion = [
                {
                    type: 'input',
                    name: 'roleName',
                    message: 'What would you like to name this role?', 
                },
                {
                    type: 'input',
                    name: 'roleSalary',
                    message: 'What is the salary for this role?', 
                },
                {
                    type: 'list',
                    name: 'departmentName',
                    message: 'What role is this role in?', 
                    choices: departmentNames
                }
            
            ]
            let {roleName, roleSalary, departmentName} = await inquirer.prompt(roleQuestion);
            const foundDepartment = rows.find(department => department.name === departmentName)
            const departmentId = foundDepartment.id
            
            db.query(
                `INSERT INTO role (name, salary, department_id) VALUES ('${roleName}', '${roleSalary}', '${departmentId}');`,
                function(err,) {
                    if (err) {
                        console.log("Error inserting role.")  
                        console.log(err)  
                    }
                     else {
                        console.log("Successfully inserted role.")
                    }
                    initialPrompt()
                }
            );  
        }
    })
}

const viewAllRoles = async () => { 
    db.query('SELECT * FROM role', async (err, roleRows) => {
        if (err) {
            console.log("Error retrieving roles.")  
            console.log(err)  
        }
        else {
            if(!roleRows.length) {
                console.log('No role found. Add one before adding a employee.')
                return initialPrompt()
            }
            const roleNames = roleRows.map(role => {
               return {Roles: role.name}
            })  
            console.table(roleNames)
            initialPrompt()
        }
     })
}

const viewAllDepartments = async () => { 
    db.query('SELECT * FROM department', async (err, departmentRows) => {
        if (err) {
            console.log("Error retrieving departments.")  
            console.log(err)  
        }
        else {
            if(!departmentRows.length) {
                console.log('No department found.')
                return initialPrompt()
            }
            const departmentNames = departmentRows.map(department => {
               return {Departments: department.name}
            })  
            console.table(departmentNames)
            initialPrompt()
        }
     })
}

const viewAllEmployees = async () => { 
    db.query('SELECT * FROM employee', async (err, employeeRows) => {
        if (err) {
            console.log("Error retrieving employees.")  
            console.log(err)  
        }
        else {
            if(!employeeRows.length) {
                console.log('No employee found.')
                return initialPrompt()
            }
            const employeeNames = employeeRows.map(employee => {
               return {Employees: `${employee.first_name} ${employee.last_name}`}
            })  
            console.table(employeeNames)
            initialPrompt()
        }
     })
}

const updateEmployee = async () => {
    db.query('SELECT * FROM role', async (err, roleRows) => {
        if (err) {
            console.log("Error retrieving roles.")  
            console.log(err)  
        }
        else {
            if(!roleRows.length) {
                console.log('No role found. Add one before adding a employee.')
                return initialPrompt()
            }
            const roleNames = roleRows.map(role => role.name)

            db.query('SELECT * from employee;', async (employeeErr, employeeRows) => {
                if (employeeErr) {
                    console.log("Error retrieving employees.")  
                    console.log(employeeErr)  
                } else {
                    if(!roleRows.length) {
                        console.log('No role found. Add one before adding a employee.')
                        return initialPrompt()
                    } else if (!employeeRows.length) {
                        console.log('No employees found. Add one before updating an employee.')
                        return initialPrompt()
                    } else {
                        const employeeNames = employeeRows.map(employee => `${employee.first_name} ${employee.last_name}`)

                        const employeeChoiceQuestion = [
                            {
                               type: 'list',
                               name: 'employeeName',
                               message: `Which employee would you like to update?`,
                               choices: employeeNames
                            }
                        ]

                        const {employeeName} = await inquirer.prompt(employeeChoiceQuestion)
                        const [firstName, lastName] = employeeName.split(' ')
                        const managerNames = employeeNames.filter(employee => employee.first_name !== firstName && employee.last_name !== lastName)

                        const {id: employeeId} = employeeRows.find(employee => employee.first_name === firstName && employee.last_name === lastName)

                        const employeeQuestion = [
                            {
                                type: 'list',
                                name: 'employeeRoleName',
                                message: 'What is this employees new role?', 
                                choices: roleNames
                            },
                        ]

                        let {employeeRoleName,} = await inquirer.prompt(employeeQuestion);
                        const foundRole = roleRows.find(role => role.name === employeeRoleName)
                        const roleId = foundRole.id

                        db.query(
                            `UPDATE employee role_id SET ('${roleId}') WHERE id = ('${employeeId}');`,
                           function(err,) {
                               if (err) {
                                   console.log("Error updating role.")  
                                   console.log(err)  
                               }
                               else {
                                   console.log("Successfully updated role.")
                               }
                               initialPrompt()
                           } 
                       )
                    }
                }
            })
        }
    })
}

const quit = () => {
    console.log("The application has been closed.")
    process.exit()
}