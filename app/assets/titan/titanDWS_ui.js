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

//Titan UI functions...
var titanDWS=(function(my){
    my.key_left         ="_KL_";                                                //template indexer
    my.key_right        ="_KR_";                                                //template indexer
    my.instance         =my.instance||"method";                                 //method prefix
    my.webServiceURL    =my.webServiceURL||$("[id$=hfWebService]").val();       //ajax api utl
    my.m                =my.m||{};                                              //method data object
    my.data_object      =my.data_object||{};                                    //ajax object
    my.JWT              =my.JWT||"";                                            //Javascript web token

    my.ui_checkbox=function (element){
        var o="",read_only=""; 
        if(element.read_only===true) read_only='readonly';
            
        if(element.html_desc!=="")  o='<label class="control checkbox" for="'+element.html_id+'">';
        else                        o='<label class="control checkbox" for="'+element.html_id+'" style="margin-top:0px;">';
        o+='<input type="checkbox" id="'+element.html_id+'" '+read_only+'>';
        o+='<span class="control-indicator"></span>';
        if(element.data_type!=="arr") o+=element.html_desc;
        //if(element.html_desc!=="") o+='</label>';
        //if(element.html_desc==="") 
            o+='</label>';
        return o;
    };                                             //BEGIN HTML ELEMENTS RULED BY-->element
    my.ui_textbox=function (element){
        var o="",read_only=""; 
        if(element.read_only===true) read_only='readonly';
        if(element.data_type!=="arr") 
            if(element.html_desc!=="") o='<label for="'+element.html_id+'">'+element.html_desc+'</label><br>';
            o+='<input class="form-control '+element.css_element+'" id="'+element.html_id+'" placeholder="'+element.html_display+'" type="text" '+read_only+' />';
        return o;
    };
    my.ui_number=function (element){
        var o="",read_only=""; 
        if(element.read_only===true) {
            read_only='readonly';
            if(element.data_type!=="arr") 
                if(element.html_desc!=="") o='<label for="'+element.html_id+'">'+element.html_desc+'</label><br>';
            o+='<input class="form-control" id="'+element.html_id+'" placeholder="'+element.html_display+'" type="text" '+read_only+' />';
        } else {
            if(element.data_type!=="arr") 
                if(element.html_desc!=="") o='<label for="'+element.html_id+'">'+element.html_desc+'</label><br>';
            o+='<input class="form-control number" id="'+element.html_id+'" placeholder="'+element.html_display+'" type="text" />';
        }
        return o;
    };
    my.ui_date=function (element){
        var o="",read_only=""; 
        if(element.read_only===true) read_only='readonly';
        if(element.data_type!=="arr") 
            if(element.html_desc!=="") o='<label for="'+element.html_id+'">'+element.html_desc+'</label><br>';
        o+='<input class="form-control date" id="'+element.html_id+'" placeholder="'+element.html_display+'" type="text" '+read_only+' />';
        return o;
    };
    my.ui_button=function (element){
        var o="",read_only=""; 
        if(element.read_only===true) read_only='readonly';
            o+='<button class="btn btn-secondary" id="'+element.html_id+'" title="'+element.html_desc+'" type="button" >'+element.html_display+'</button>';
        return o;
    };
    my.ui_textarea=function (element){
        var o="",read_only=""; 
        if(element.read_only===true) read_only='readonly';
        if(element.data_type!=="arr") 
            if(element.html_desc!=="") o='<label for="'+element.html_id+'">'+element.html_desc+'</label>';
        o+='<textarea class="form-control '+element.css_element+'" rows=10 id="'+element.html_id+'" placeholder="'+element.html_display+'" '+read_only+' >'+element.html_display+'</textarea>';
        return o;
    };
    my.ui_select=function (element){
        var o="",read_only=""; 
        if(element.read_only===true) read_only='readonly';
        if(element.data_type!=="arr") 
            if(element.html_desc!=="") o='<label for="'+element.html_id+'">'+element.html_desc+'</label>';
        o+='<select class="form-control" id="'+element.html_id+'" '+read_only+'>';
        if(my.m[element.data_source]){
            var display="",value="";
            for(index in my.m[element.data_source]) {
                value   =my.m[element.data_source][index][element.data_value];
                display =my.m[element.data_source][index][element.data_display];
                o+=my.ui_option(display,value);
            }//end for
        }//end if
        o+='</select>';
        return o;
    };                                               //END HTML ELEMENTS RULED BY-->element
    my.ui_label=function(element){                                                     
        return '<span class="label">'+element.display+'</span>';
    };
    my.ui_option=function(display,value){                                                     //sub item.. no element
        return '<option value="'+value+'">'+display+'</option>';
    };
    my.ui_form_group=function(data){
        return '<div class="form-group">'+data+"</div>";
    };
    my.ui_row=function(data){
        return '<div class="row">'+data+"</div>";
    };
    my.ui_row_start=function(){
        return '<div class="row">';
    }; 
    my.ui_row_end=function(data){
        return "</div>";
    };
    my.ui_ace=function(element){
        return '<div class="ace" id="'+element.html_id+'"></div>';
    };
    my.ui_column=function(data,size){
        return '<div class="col-'+size+'">'+data+"</div>";
    };
    my.ui_column_start=function(size){
        return '<div class="col-xs-'+size+'" style="clear both!important">';
    };
    my.ui_column_end=function(data,size){
        return "</div>";
    };
    my.ui_tabs_start=function(){
        return '<div class="tabs"><ul>';
    };
    my.ui_tabs_close=function(datasize){
        return '</ul>';
    };
    my.ui_tabs_end=function(datasize){
        return '</div>';
    };
    my.ui_tab=function(element){
        return '<li><a href="#tab_'+element.html_id+'">'+element.html_display+"</a></li>";
    };                                                   //RULED BY MERCILESS ELEMENT
    my.ui_tab_container_start=function(element){
        return '<div class="tab-container" id="tab_'+element.html_id+'">';
    };                                   //RULED BY MERCILESS ELEMENT
    my.ui_tab_container_close=function(){
        return '</div>';
    };
    my.ui_tab_container_end=function(){
        return '<div style="clear:both;"></div></div>';
    };
    my.ui_column2_start=function(element){
        return '<div class="t-column">';
    };                                   //RULED BY MERCILESS ELEMENT
    my.ui_column2_end=function(element){
        return '</div>';
    };                                   //RULED BY MERCILESS ELEMENT
    my.ui_section=function(section,data){
        return '<div class="row"><h2>'+section+'</h2>'+data+"</div>";
    };
    my.ui_add=function(element){
        var o="",read_only=""; 
        if(element.read_only===true) read_only='readonly';
            o+='<button class="btn btn-secondary add_template" data-source="'+element.data_source+'" data-target="'+element.target+'" id="'+element.html_id+'" title="'+element.html_desc+'" type="button" >'+element.html_display+'</button>';
        return o;
    };
    my.ui_table=function(head,body){
        return '<table class="table  table-condensed  table-striped table-hover">'+head+body+'</table>';
    };
    my.ui_table_header=function(data){
        return '<thead>'+data+'</thead>';
    };
    my.ui_table_body=function(data){
        return '<tbody>'+data+'</tbody>';
    };
    my.ui_table_column=function(data,hover){
        return '<th title="'+hover+'">'+data+'</th>';
    };
    my.ui_table_row=function(name,data){
        return '<tr data-id="row_'+my.key_left+"0"+my.key_right+'" class="data_'+name+'">'+data+'</tr>';
    };
    my.ui_table_child_row=function(data){
        return '</tr><tr data-id="row_'+my.key_left+"0"+my.key_right+'" class="child_row">';
    };
    my.ui_table_data=function(colspan,data){
        return '<td colspan="'+colspan+'">'+data+'</td>';
    };
    my.ui_table_data_start=function(colspan,data){
        return '<td colspan="'+colspan+'">';
    };
    my.ui_table_data_end=function(colspan,data){
        return '</td>';
    };
    my.ui_table_child_toggle=function(colspan){
        return '<div class="child_toggle"><i class="lh-49 nc-icon-mini arrows-1_small-triangle-down"></i></div>';
    };
    my.ui_table_row_re_id=function (data,id){
        var o="";
        o=data.split(my.key_left+"0"+my.key_right).join(my.key_left+id+my.key_right);
        return o;
    }
    my.ui_table_rows=function(data,count){      
        var o="";
        for(i=0; i<count; i++ ){
            o+=data.split(my.key_left+"0"+my.key_right).join(my.key_left+i+my.key_right);
        }
        return o;
    };
   return my;
}(titanDWS|| {}));