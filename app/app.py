from flask import Flask, request,send_from_directory, render_template, Blueprint
import jsonpickle
import ddb
 

# NOTE no wierd routes for static stuff, just add these 2 variables and it just works...
app = Flask(__name__,static_url_path='/assets',static_folder='assets')
app.debug = True
app.secret_key = 'this thing i think i thought once.'

@app.route('/')
def home():
    message = "EH? YEt another bloody template system..."
    return render_template('index.html', message=message)



class titanDWS_CRUD:
    engine=None

    def __init__(self):
        self.load_db()

    def load_db(self):
        init_sql="""

        create temporary table titanDWS.entity        (uid,name,description) file='{0}/entity.txt' delimiter='|';
        create temporary table titanDWS.dept          (uid,name,description) file='{0}/department.txt' delimiter='|';
        create temporary table titanDWS.category      (uid,name,description) file='{0}/category.txt' delimiter='|';
        create temporary table titanDWS.menu          (uid,name,description,method,icon) file='{0}/menu.txt' delimiter='|';
        create temporary table titanDWS.methods       (uid,name,description,query) file='{0}/methods.txt' delimiter='|';
        create temporary table titanDWS.permissions   (uuid,entity,deptartment,category,method,user_uuid) file='{0}/permissions.txt' delimiter='|';

        """.format("app/database")
        e=ddb.engine(config_dir=False,mode='object',debug=None)
        # now the tables are readable and portable 
        res=e.query(init_sql)
        self.engine=e
        
    def get_permissions(self,uuid):
        query="SELECT * FROM titanDWS.permissions where user_UUID='{0}' and active=1".format(uuid)
        res=self.engine.query(query)
        for row in res.data:
            
            
        return res
    


@app.route('/titanDWS/api/menu', methods=['POST','GET'])
def menu():
    try:
        req_data= request.get_json()
        user_UUID="CHRIS"
        e=titanDWS_CRUD()
        perms=e.get_permissions(user_UUID)


        serialized = jsonpickle.encode( perms,
                                        unpicklable=False,
                                        make_refs=False)
        return serialized
    except Exception as ex:
        return "{0}".format(ex)




@app.route('/titanDWS/api/fetch', methods=['POST'])
def fetch():
    """Return the results of a data request based on the configuration UID, options include search, pagination and sorting"""
    req_data= request.get_json()
    
    ## ddb uses text files, using this as to eat my own dogfoor and improve
    ## no service sql client. No daemon, low cpu.


    e=load_db()
    try:
        res=e.query(req_data['query'])
        
        serialized = jsonpickle.encode( res,
                                        unpicklable=False,
                                        make_refs=False)
        return serialized
    except Exception as ex:
        return "{0} -> '{1}'".format(ex,req_data['query'])



if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000)
    


"""
    -entity
        - dept
            - category
                -menu item 


    COMPANY
        ACCOUNTING
            AR
                REMITT
            AP
                Billing
        SHIPPING
            Packages
                Incomming
                Outgoing
        TECHOPS

        DEVOPS

        INFRA
            Statistics
                RUNNING SERVERS
                TOTAL SERVERS
        DEVELOPMENT
            PROJECTS
                NEW DEV
                NEW DEV 2
            TEST
                TEST WEB1
            QA
                QA Guidelines

        EXECUTIVE

    COMPANY -> DEPT -> CATEGORIES -< Menu Items
    | COMPANY      | [ DEPT ]   
         MEnu 1   Menu 2  Menu 3
"""
