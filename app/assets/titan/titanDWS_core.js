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
//Titan core functions... Ajax/ Math.. Reusable items

var titanDWS=(function(my){
    my.instance         =my.instance||"method";                                 //method prefix
    my.webServiceURL    =my.webServiceURL||$("[id$=hfWebService]").val();       //ajax api utl
    my.m                =my.m||{};                                              //method data object
    my.data_object      =my.data_object||{};                                    //ajax object
    my.JWT              =my.JWT||"";                                            //Javascript web token

    my.load =function(method,success_func){
        $.ajax({type: "POST", url: my.webServiceURL +"/" + method, data:my.data_object, headers:{'JWT':my.JWT},
                success: function(results){if(success_func){success_func(results);}}, error: this.error, dataType: "json" }); 
    };
    my.token_success    =function(json_result) {
        if(json_result) { 
            my.JWT=json_result; 
        }
    };
    my.get_token        =function(func){ 
        my.load("api/get_token", function(results){ my.token_success(results); 
            if(func) func(); });   
    };
    my.obj_to_string=function(obj){
        return  JSON.stringify(obj);                                                    //needs everything to be an object... {} not []
    };
    my.set_instance         =function(_instance){ 
        my.instance=_instance; 
    };
    my.set_titan_ajax_object=function(_data_obj){ 
        my.data_object=_data_obj; 
    };

    return my;
}(titanDWS || {}));//auto execute the function, closure.. etc..
