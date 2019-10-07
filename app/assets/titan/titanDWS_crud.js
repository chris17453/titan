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
//titan crud functions
var titanDWS=(function(my){
    my.instance         =my.instance||"method";                                 //method prefix
    my.webServiceURL    =my.webServiceURL||$("[id$=hfWebService]").val();       //ajax api utl
    my.m                =my.m||{};                                              //method data object
    my.data_object      =my.data_object||{};                                    //ajax object
    my.JWT              =my.JWT||"";                                            //Javascript web token

    //Get the localization of a particular HTML_ID
    my.get_local            =function(id){
        var index;
        for(index in my.m.localization) if(my.m.localization[index].field===id) return my.m.localization[index];
        return null;
    };
    my.set_html_value_for_element=function(type,id,value){
        if(null===value || 
            null===id    ||
            null===type  ||
            "undefined" === typeof type ||
            "undefined" === typeof id ||
            "undefined" === typeof value) {
            return;                                                   //dont set null things or null values
        }
        switch(type){
            case "CHECKBOX": if(value===true) $("#"+id).prop("checked",true); 
                                if(value===false) $("#"+id).prop("checked",false); 
                                break;
            case 'ACE'     : var editor = ace.edit(id);
                                editor.setValue(value);
                                break;
            default       :  if (typeof value === "string" ) value=value.trim();
                                if(value==="''") value="";
                                if(value==='""') value="";
                                $("#"+id).val(value);                 
                            break;
        }//end switch
    };
    my.get_html_value_for_element=function(type,id,fragment){
        if(null===id    ||
            null===type  ||
            "undefined" === typeof type ||
            "undefined" === typeof id ) {
            return;                                                   //dont set null things or null values
        }
        if(null===fragment ||"undefined" === typeof fragment) {
            fragment="0";
        }
               
        var value="";
        switch(type){
            case "CHECKBOX": value=$("#"+id).prop("checked");
                                break;
            case 'ACE'     : var editor = ace.edit(id);
                                value=editor.getValue();
                                break;
            default       :  value=$("#"+id).val();                 
                                if(null!==value && "undefined"!== typeof value) {
                                    if (typeof value === "string") value=value.trim();
                                    if(Number.isInteger(fragment)){
                                    value=parseInt(value);                                           
                                    }//end if is number
                                }//end if null 
                                break;
        }//end switch
        if(Number.isInteger(fragment) && (value===null || "undefined"=== typeof value)){
            value=0;
        }//end if is number
        if("undefined"=== typeof value || value===null) {
            value="";
        }
        return value;
    };
  //This populates Existing HTML Form elements with JSON data    -------------> FILL
    my.load_json_into_html=function(update_element){
        var i,key,key2,key3,local,element,value;
        var parameter_length=0;
        if(!my.m.parameters || parameter_length===0) my.m.parameters=[];
        parameter_length=my.m.parameters.length;
        //my.m.parameters.push(jQuery.extend(true, {}, my.m.parameter_template));
            
        for(index in my.m.localization){
            element=my.prep_element_data(my.m.localization[index]);
            id=element.html_id;
            switch(element.data_type){
                case "flat": value=my.m[element.field];                                                //sets the flat/ROOT element values of the JSON object
                                if(null===element.type) continue;                                      //skip nulls
                                my.set_html_value_for_element(element.type,id,value);
                                break;
                case "arr":  for(key in my.m[element.name]){                                           //arr is a loop on a root element NOT FLAT, INDEX MUST BE A NUMBER.
                                if(null===element.type) continue;                                   
                                if(null===my.m[element.name]) continue;
                                if(null===my.m[element.name][key]) continue;//
                                if(null===my.m[element.name][key][element.field]) continue;            //skip nulls
                                id=my.calc_html_id(element,key);            
                                value=my.m[element.name][key][element.field];  
                                my.set_html_value_for_element(element.type,id,value);
                                }
                                break;
                case "obj":  value=my.m[element.name][element.field];                                  //object and element are FLAT, just obj has a parent element.
                                if(null===element.type) continue;                                      //skip nulls
                                my.set_html_value_for_element(element.type,id,value);
                                break;
            }
                
        }//end localization loop
    };//end function
    //This creates a JSON object based of HTML elements that have CHANGED since load.   EXTRACT  <---------------------
    my.load_json_from_html=function(){
        var i,key,key2,key3,local,element,value;
        var m_update=jQuery.extend(true, {}, my.m);
        m_update.localization           ={};                                                            //remove heavy internal only JSON from transport
        m_update.template               ={};
        m_update.templates              ={};
        m_update.parameter_template     ={};
        m_update.column_template        ={};
        m_update.result_types           ={};
        m_update.output_types           ={};
        m_update.parameter_types        ={};
        m_update.external_map           ={};
        m_update.methods                ={};
        m_update.linked_method_template ={};
        m_update.queries                ={};
        
        for(index in my.m.localization){
            element=my.prep_element_data(my.m.localization[index]);
            id=element.html_id;
            if(element.display==='ORDR') {
                var a="";
            }
            switch(element.data_type){
                case "flat": if("undefined"===typeof my.m[element.field] || null===element.type) continue;                                      //skip nulls
                                m_update[element.field]=my.get_html_value_for_element(element.type,id,my.m[element.field]);
                                break;
                case "arr":  for(key in my.m[element.name]){                                           //arr is a loop on a root element NOT FLAT, INDEX MUST BE A NUMBER.
                                if(null===element.type) continue;                                   
                                if(null===my.m[element.name]) continue;
                                if(null===my.m[element.name][key]) continue;//
                                if("undefined"===typeof my.m[element.name][key][element.field]) continue;            //skip nulls
                                id=my.calc_html_id(element,key);            
                                    
                                m_update[element.name][key][element.field]=my.get_html_value_for_element(element.type,id,my.m[element.name][key][element.field]);
                                }
                                break;
                case "obj":  if("undefined"===typeof my.m[element.name] || null===element.type) continue;                                      //skip nulls
                                m_update[element.name][element.field]=my.get_html_value_for_element(element.type,id,my.m[element.name][element.field]);
                                break;
            }//en switch
        }//end localization loop
        //m_update.columns={};
        //m_update.parameters={};           //for testing as most errors are in the column/param area JSS will fail on null's or mismatched types. EMPTY objects are ok.
        m_update.insert_query           ="";
        m_update.update_query           ="";

        for(key in m_update.parameters) {
            if(m_update.parameters[key].name==="") m_update.parameters[key]=null;           //remove empty parameters
        }
        return m_update;
    };//end function
    my.calc_html_id=function(element,key){
        if(null===key || key===undefined) key='0';
            
        var calc_field=element.field;
        switch(element.data_type){
            case "obj" : calc_field=my.instance+"_"+element.name+"_OBJ_"  +element.field; break;
            case "arr" : calc_field=my.instance+"_"+element.name+my.key_left+key+my.key_right+element.field; break;
            case "flat": 
            default    : calc_field=my.instance+"_"+element.field; break;
        }
        return calc_field;
    };
    my.prep_element_data=function (element) {
        var calc_display=element.display;
        var calc_field  =my.calc_html_id(element);
        var calc_desc   =element.description;
            

        if(null!==element.data_display && element.data_display!=="") {                                  //change the html display based on dynamic stuff.
            //var disp_tokens=element.data_display.split('.');
            if(element.data_source.length>0) {
                //calc_display=my.m[element.data_source][element.data_display];
                calc_desc=my.get_element(element.data_source+"["+element.data_display+"]");
            } else {
                calc_display=my.get_element(element.data_display);
            }
            if(undefined===calc_display  || null===calc_display || calc_display.trim()==='') { 
                calc_display=element.display; 
            }       //overide reert if mapping is a dud.
        }
        if(null!==element.data_desc && element.data_desc  !=="") {                                      //change the html display based on dynamic stuff.
            if(element.data_source.length>0) {
                //calc_desc=my.m[element.data_source][element.data.desc];
                calc_desc=my.get_element(element.data_source+"["+element.data_desc+"]");
            } else {
                calc_desc=my.get_element(element.data_desc);

            }

            if(undefined===calc_desc || null===calc_desc || calc_desc.trim()==='') { calc_desc=element.description; }           //overide reert if mapping is a dud.
        }   
        var new_element=jQuery.extend(true, {}, element);                                               //returned cloned object. Jquery deep clone.
        new_element.html_id     =calc_field;
        new_element.html_display=calc_display;
        new_element.html_desc   =calc_desc;
        return new_element;
    };
    //this creates the HTML for the form
    my.create_form=function(update_element){
        var sections=[],cat="",o="";
        var id="",value="",element=null,group="",last_group="";
        var in_child_row=false;
        var in_multi_loop=false;
        var html_data,update=false;
        if(!my.m) return;
        if(!my.m.localization) return;
        if(null!==update_element && undefined!==update_element) {
            update=true;
        }
            
        for(index in my.m.localization){
            if(update){
                if(my.m.localization[index].name!==update_element) continue;
            }

            element=my.prep_element_data(my.m.localization[index]);                    
                    
            last_group=group;
            group=element.category;
            if(!sections[group]) {
                sections[group]={type:element.container,headers:"",data:'',length:element.colspan,name:element.name};
            }

            switch(element.container){
                case "TABSTART"     : sections[group].data+=my.ui_tabs_start           (element); break;
                case "TABCLOSE"     : sections[group].data+=my.ui_tabs_close           (); break;
                case "TABEND"       : sections[group].data+=my.ui_tabs_end             (); break;
                case "TABCONTSTART" : sections[group].data+=my.ui_tab_container_start  (element); break;
                case "TABCONTEND"   : sections[group].data+=my.ui_tab_container_end    (); break;
                case "COLSTART"     : sections[group].data+=my.ui_column2_start        (); break;
                case "COLEND"       : sections[group].data+=my.ui_column2_end          (); break;
                case "ROW"          : sections[group].data+=my.ui_row_start();             break;
                case "ROWSTART"     : sections[group].data+=my.ui_row_start();             break;
                case "BREAK"        : sections[group].data+=my.ui_table_child_row      (); in_child_row=true; continue; 
                case "TABLEROW"     : sections[group].data+=my.ui_table_data_start     (element.colspan); break;
            }
            switch(element.wrapper){
                case 'col'          : sections[group].data+=my.ui_column_start     (4); break;
                default: break;
            }

            if(element.container==="TABLEROW") {
                if(last_group!==group) {
                    in_child_row=false;
                }
                if(element.type && element.type!=="" && !in_child_row){
                    sections[group].headers+=my.ui_table_column(element.html_display,element.html_desc);
                }
                in_multi_loop=true;
            } else {
                in_multi_loop=false;
                in_child_row=false;
            }                    
            var css_wrap="sm-1"; if(null!== element.css_wrapper  && element.css_wrapper  !=="") { css_wrap=element.css_wrapper;   }                                 //css override
    
            switch(element.type){
                case "ACE"          : sections[group].data+=my.ui_ace     (element); break;                        //this is special. Ace GUI TExt DIV
                case "ADD"          : sections[group].data+=my.ui_add     (element); break;                        //this is special. It adds new JSON templates to the data object so NEW ROW of *Stuff                 
                case "CHILDROW"     : sections[group].data+=my.ui_table_child_toggle(element.colspan); break;
                case "TAB"          : sections[group].data+=my.ui_tab     (element); break;
                case "BUTTON"       : sections[group].data+=my.ui_button  (element); break;
                case "DATE"         : sections[group].data+=my.ui_date    (element); break;
                case "NUMBER"       : sections[group].data+=my.ui_number  (element); break;
                case "LABEL"        : sections[group].data+=my.ui_label   (element); break;
                case "TEXT"         : sections[group].data+=my.ui_textbox (element); break;
                case "CHECKBOX"     : sections[group].data+=my.ui_checkbox(element); break;
                case "SELECT"       : sections[group].data+=my.ui_select  (element); break;
                case "TEXTAREA"     : sections[group].data+=my.ui_textarea(element); break;
            }
            
            switch(element.wrapper){
                case 'col'          : sections[group].data+=my.ui_column_end     (); break;
                default: break;
            }
            switch(element.container){
                case "ROW"          : sections[group].data+=my.ui_row_end();             break;
                case "ROWEND"       : sections[group].data+=my.ui_row_end();             break;
                case "TABLEROW"     : sections[group].data+=my.ui_table_data_end();             break;
            }//end switch after element

        }//end element loop / localization

        //join the actual HTML
        for(group in sections) {
            switch(sections[group].type){
                case 'TABLEROW':
                                var count=0;
                                if(my.m[sections[group].name]) {
                                    count+=my.m[sections[group].name].length;
                                 }
                                if(update) {
                                    var row_data=my.ui_table_row(sections[group].name,sections[group].data);
                                    row_data=my.ui_table_row_re_id(row_data,count-1);
                                    $('.data_'+sections[group].name).last().after(row_data);  //directly inject th data into the form. it already exists
                                    
                                    return row_data;
                                }
                                table=  my.ui_table(
                                            my.ui_table_header(my.ui_table_row(sections[group].name,sections[group].headers) ),
                                            my.ui_table_body(my.ui_table_rows(my.ui_table_row(sections[group].name,sections[group].data),count) 
                                                    ) );
                                o+=my.ui_section(group,table);
                                break;
                default :     o+=sections[group].data;
            }
        }
        return o;
    };//end function
    //This function binds new HTML elements to the jQuery actions
    my.get_element=function(name) {
        try{
        var element=eval("my.m."+name);
        return element;
        } catch(ex){
            var r=0;
        }
        return "";
    }
    my.bind_jQuery=function(){
        $(".tabs" ).tabs();                                                 //activate jQuery UI Tabs
        $(".number").spinner();                                             //activate jQuery UI Number Picker
        $(".date").datepicker();                                            //activate jQuery UI Date Picker
        $(".number").spinner({ classes: {
                "ui-spinner"     : "ui_spinner-ovd",//"ui-corner-all",
                "ui-spinner-down": "ui-corner-br",
                "ui-spinner-up"  : "ui-corner-tr"
            }});
        $(document).on("click", ".child_toggle" ,function(){                //display child rows action
            var data_id=$(this).closest('tr').data('id');
            var element=$('.child_row[data-id='+data_id+']');
            var display=$('.child_row[data-id='+data_id+']').css("display");
            if(display==="none") display="table-row";
            else display="none";
            $('.child_row[data-id='+data_id+']').css("display",display);
                return false;
            }
        );
        $(document).on("click", ".add_template" ,function(){                //add templated data to UI
            //this.load_json_from_html();
            var source=$(this).data("source");
            var target=$(this).data("target");
            var template=my.get_element(source);
            var dest=my.get_element(target);
            dest.push(jQuery.extend(true, {},template ));
            var html_fragment=my.create_form(target);
            $(".number").spinner();                                             //activate jQuery UI Number Picker
            //hack
            $(".date").datepicker();                                            //activate jQuery UI Date Picker
            $(".number").spinner({ classes: {
                    "ui-spinner"     : "ui_spinner-ovd",//"ui-corner-all",
                    "ui-spinner-down": "ui-corner-br",
                    "ui-spinner-up"  : "ui-corner-tr"
                }});
        
            //alert (html_fragment);
           }
        );

        $( ".ace" ).each(function( index ) {                               //loops through all ace editors and sets the theme and language type...
            var id=$( this ).attr('id');
            var editor = ace.edit(id);
            ace.require("ace/ext/chromevox");
            editor.session.setMode("ace/mode/sql");
            editor.setTheme("ace/theme/tomorrow");
        });
    };
    //this is the main configuration UI creation method.
    my.update_UI=function(){
        var o=my.create_form();
        $("#titan_crud").html(o);                                                       //BLIT auto built form to the page.
        my.bind_jQuery();
        my.load_json_into_html();
    };
    return my;
}(titanDWS || {}));
