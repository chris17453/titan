/******************************************************************** 
  ████████╗██╗████████╗ █████╗ ███╗   ██╗██████╗ ██╗    ██╗███████╗
  ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║██╔══██╗██║    ██║██╔════╝
     ██║   ██║   ██║   ███████║██╔██╗ ██║██║  ██║██║ █╗ ██║███████╗
     ██║   ██║   ██║   ██╔══██║██║╚██╗██║██║  ██║██║███╗██║╚════██║
     ██║   ██║   ██║   ██║  ██║██║ ╚████║██████╔╝╚███╔███╔╝███████║
     ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚══╝╚══╝ ╚══════╝
*********************************************************************
   Created: 10-01-2017
   Author : Charles Watkins
   Email  : charles.watkins@pb.com
********************************************************************/
//titan crud functions
var titanDWS=(function(my){
    my.instance         =my.instance||"method";                                 //method prefix
    my.webServiceURL    =my.webServiceURL||$("[id$=hfWebService]").val();       //ajax api utl
    my.m                =my.m||{};                                              //method data object
    my.data_object      =my.data_object||{};                                    //ajax object
    my.JWT              =my.JWT||"";                                            //Javascript web token


    return my;
}(titanDWS || {}));                                                                                    //auto execute the function, closure.. etc..
