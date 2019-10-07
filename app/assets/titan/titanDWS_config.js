/******************************************************************** 
  ████████╗██╗████████╗ █████╗ ███╗   ██╗██████╗ ██╗    ██╗███████╗
  ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔══██╗██║    ██║██╔════╝
     ██║   ██║   ██║   ███████║██╔██╗ ██║██║  ██║██║ █╗ ██║███████╗
     ██║   ██║   ██║   ██╔══██║██║╚██╗██║██║  ██║██║███╗██║╚════██║
     ██║   ██║   ██║   ██║  ██║██║ ╚████║██████╔╝╚███╔███╔╝███████║
     ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚══╝╚══╝ ╚══════╝
*********************************************************************
   Created: 01-23-2017
   Author : Charles Watkins
   Email  : chris17453@gmail.com
********************************************************************/
//titanDWS configuration module. Uses CRUD/Lolcalization  UI & Core

var titanDWS = (function (my) {
    my.instance         =my.instance||"method";                                 //method prefix
    my.webServiceURL    =my.webServiceURL||$("[id$=hfWebService]").val();       //ajax api utl
    my.m                =my.m||{};                                              //method data object
    my.data_object      =my.data_object||{};                                    //ajax object
    my.JWT              =my.JWT||"";                                            //Javascript web token
    
    $(document).on("click", ".preview_json_out",function(){
        var new_obj=my.load_json_from_html();
        $("#json_pre").html("<pre>"+JSON.stringify(new_obj,"\t",4)+"</pre>");
        $("#json_dialog").dialog({title: "Preview Outgoing JSON",width:1200,height:400});
    });
    $(document).on("click", ".preview_json_in",function(){
        var new_obj=my.load_json_from_html();
        $("#json_pre").html("<pre>"+JSON.stringify(my.m,"\t",4)+"</pre>");
        $("#json_dialog").dialog({title: "Preview Incomming JSON",width:1200,height:400});
    });

    my.load_method_success  =function(jsonResult) {
        my.m = jsonResult.results;
        my.method=my.m;
        my.update_UI();
        $(document).on("click", ".save_method", my.save_method);
        $(document).on("click", ".test_method", my.test_method);
    
    };
    my.save_success         =function(json_result) {
        if(json_result.results) {
            alert(json_result.results);
        }
    };
    my.test_success         =function(json_result) {
        if(json_result.results) {
            alert(json_result.results);
        }
    };
    my.load_method          =function() {  
        if(my.JWT=="") {
            my.get_token(function() { my.load("api/fetch_method", my.load_method_success);   });
        }
    };
    my.save_method          =function(){   
        my.data_object.crud=JSON.stringify(my.load_json_from_html());
        my.load("api/save_method", my.save_success);   
    };       
    my.test_method          =function(){   
        my.data_object.crud=JSON.stringify(my.load_json_from_html());
        my.load("api/test_method",my.test_success);   
    };

    

    return my;
}(titanDWS || {}));                                                                                    //auto execute the function, closure.. etc..
