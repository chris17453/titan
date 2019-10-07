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
//Just remember to setup the titanGlobalAjaxObject                     
//var titanGlobalAjaxObject={};

    function XML2JSON(node) {
        var	data = {};
        if(undefined===node || null===node) return "";
        function Add(name, value) {
            if (data[name]) {
                if (data[name].constructor !== Array) {
                    data[name] = [data[name]];
                }
                data[name][data[name].length] = value;
            } else {
                data[name] = value;
            }
        };

        var c, cn;
        if(null!==node.attributes && undefined!==node.attributes){
            for(c = 0; c< node.attributes.length; c++) { 
                cn=node.attributes[c];
                Add(cn.name, cn.value); 
            }
        }
        if(null!==node.childNodes && undefined!==node.childNodes){
            for(c = 0; c < node.childNodes.length; c++) { 
                cn=node.childNodes[c];
                if (cn.nodeType === 1) { 
                    if (cn.childNodes.length === 1 && cn.firstChild.nodeType === 3) { // text value 
                        Add(cn.nodeName, cn.firstChild.nodeValue); 
                    } else { // sub-object 
                        Add(cn.nodeName, XML2JSON(cn)); 
                    } 
                } 
            }
        }
        return data;
    }

var titanDWS = null;
var titan_external=null;
$(function () {
    titan_external = (function () {
        var webServiceURL = $("[id$=hfWebService]").val();
        var shipServiceURL = $("[id$=hf_EnrouteWebService]").val();
        var token = $("[id$=hf_token]").val();
        var JWT = "";

        //JSON rapper for webAPI
        var load = function (method, success_func, data_object) {
            if (JWT === "") JWT = titanDWS.JWT;
            $.ajax({
                type: "POST", url: webServiceURL + "/" + method, data: data_object, headers: { 'JWT': JWT }, contentType: "application/json",
                success: function (results) {
                    if (!results || !results.results) {
                        alert("Data error");
                        return;
                    }
                    if (success_func) { success_func(results.results); }
                }, error: this.error, dataType: "json"
            });
        }
        //XML wrapper for ASMX
        var ship_service = function (method, success_func, data_object) {
            if (token === "") token = titanDWS.JWT;
            $.ajax({
                type: "POST", url: shipServiceURL + "/" + method, data: data_object, contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function (results) {
                    if (!results) {
                        alert("Data error");
                        return;
                    }
                    if (success_func) { success_func(results); }
                }, error: this.error, dataType: "xml"
            });
        }
        $(window).keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return false;
            }
        });
        var anchor_data_events = function () {                                             //makes allthe dynamic objects clickable
            //alert(binding);2
            $(document).on("click", '.view-info', view_info);                  //statement details
            $(document).on("click", '.print-label', print_label);                //1st label generated
            $(document).on("click", '.cancel-manifest', cancel_manifest);            //cancel's an item on the manifest (not shipping it)
            $(document).on("keyup", '#multi_search', multi_search);               //on enter in multi search
            $(document).on("click", '.print_manifest', print_manifest);             //prints what being shipped by carrier
            $(document).on("click", '.print_pickup_label', print_pickup_label);         //prints driver pickup label
        }
        var multi_search = function (event) {
            if (event.keyCode === 13) {
                $("#titanClient").trigger('pagerUpdate');                               //update pager
                $("#titanClient").trigger('Update');                                    //update pager
                return false;
            }
        }
        var view_info = function (event) {
            var id = $(event.target).data('id');
            $("#info-detail").data("id", id);
            $("#info-contents").data("id", id);
            $("#info-status").data("id", id);
            $("#info-track").data("id", id);
            $('.view-info-dialog').dialog({
                show: "fade",
                hide: "fade",
                modal: true,
                height: 490,
                width: 480,
                resizable: true,
                title: 'Shipment Contents'
            });

            titan_external.show_info_detail();
            //$('#dialog_iframe').attr('src', './shipment_detail.aspx?showdetail=1&mod=1&id="'+id);
        }
        var print_manifest = function () {
            var manifest_id = $("#print_manifest_id option:selected").val();
            window.open('../ship/printmanifest.aspx?id=' + manifest_id, 'Print Manifest',
                'width=800, height=600, status=0, toolbar=0, location=0, menubar=0, directories=0, resizable=1, scrollbars=1').setTimeout('focus();', 200);
        }
        var cancel_success = function (xml) {
            var status = $(xml).find("status");

            if ($(status).text() === '0') {
                alert($(xml).find("error").text());
            } else {
                alert("Shipment Canceled");
                titanDWS.update_data();
            }
        }

        var close_manifest_control_success = function (data) {
            var jsonData = XML2JSON(data);
            var x = "";
            if (jsonData.shippers.status === "1") {
                var select = "<table><tr><td>Ship all packages for: </td><td><select id='close_manifest_id'>";
                var total_shipments = 0;
                var unique_shippers = [];
                for (i in jsonData.shippers.shipper) {
                    shipper = jsonData.shippers.shipper[i];
                    if (shipper.labeled_shipment_count === "0") continue;
                    total_shipments++;
                    if (unique_shippers[shipper.shipper_id + "|" + shipper] === 1) continue;           //dont show the same thing twice.
                    unique_shippers[shipper.shipper_id + "|" + shipper] = 1;
                    select += "<option value='" + shipper.shipper_id + "|" + shipper.accountno + "'>" + shipper.shipper_name + "-" + shipper.accountno + " (" + shipper.labeled_shipment_count + ")" + "</option>";
                }
                select += "</select></td><td>&nbsp;<button type='button' onclick='titan_external.close_manifest()'>Close&nbsp;Manifest</button></td></tr></table>";
                if (total_shipments === 0) {
                    $("#close_manifest").html("<table><tr><td>No Shipments to manifest.</td></tr></table>");
                } else {
                    $("#close_manifest").html(select);
                }
            } else {
                alert("Error pulling shipper accounts");
            }
            titan_external.print_manifest_control();                                //LAUNCH PRINT MANIFEST CONTROL
            print_pickup_label_control(jsonData);
        }//end manifest close control
        var print_manifest_control_success = function (data) {
            var jsonData = XML2JSON(data);
            var x = "";
            var select = "<table><tr><td>Print this: </td><td><select id='print_manifest_id'>";
            var total = 0;
            if (!Array.isArray(jsonData.manifests.manifest)) {
                jsonData.manifests.manifest = [jsonData.manifests.manifest];
            }
            for (i in jsonData.manifests.manifest) {
                total++;
                manifest = jsonData.manifests.manifest[i];

                var manifestDateTime = new Date(manifest.created);
                var hours = manifestDateTime.getHours();
                var minutes = manifestDateTime.getMinutes();
                var ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0' + minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                var manifestCreatedDate = manifestDateTime.getMonth() + 1 + "/" + manifestDateTime.getDate() + "/" + manifestDateTime.getFullYear() + " " + strTime;

                select += "<option value='" + manifest.id + "'>" + manifest.shipper_name + " " + manifestCreatedDate + " (" + manifest.count + ")" + "</option>";
                }
            select+="</select></td><td><button type='button' class='print_manifest'>Print Manifest</button></td>"
            select+="</tr></table>"
            if(total===0) {
                $("#print_manifest").html("No manifest to print.");
            } else {
                $("#print_manifest").html(select);
            }
        }//end manifest print control
        var print_pickup_label_control=function(jsonData){
            if($("[id$=hftoolbarversioninfo]").val()==="0.0.0.0"){                   //no toolbar   
                return;
            } 

            var select="<table><tr><td>Print this: </td><td><select id='print_manifest_id'>";
            var total=0;
            
            for(i in jsonData.shippers.shipper){
                shipper=jsonData.shippers.shipper[i];
                if (shipper.labeled_shipment_count === "0") continue;
                    if(shipper.shipper_name==="UPSAPI" || shipper.shipper_name=="UPSEMT" || shipper.shipper_name.indexOf("Shipping API")>0){
                        select+="<option value='"+shipper.shipper_id+"'>"+shipper.shipper_name+" ("+shipper.labeled_shipment_count+")"+"</option>";
                        total++;
                    }
                }
            select+="</select></td><td><button type='button' class='print_pickup_label'>Pickup Label</button></td>"
            select+="</tr></table>"
            if(total===0) {
                $("#print_pickup_label").html("No pickup label to print.");
            } else {
                $("#print_pickup_label").html(select);
            }
        }//end manifest pickup label control
        var print_pickup_label=function(){
            var id  =data=$("#print_manifest_id option:selected").val();
            var text=data=$("#print_manifest_id option:selected").text();

             if(~text.indexOf("UPSEMT") || ~text.indexOf("UPSAPI")){
                $("[id$=hfBHOBehaviors]").val("pickup_label");
                $("[id$=hfShipmentIds]") .val(id);
                $("#enr_toolbar_override").val("manifest_behaviors");
                $("[id$=Note]").text("Toolbar is attempting to print Pickup Label for manifest id " +id+ ".");
            } else 
            if (~text.indexOf("Shipping API")){
                $("[id$=hfBHOBehaviors]").val("pickup_report");
                $("[id$=hfPickupLabel]") .val(id);
                $("#enr_toolbar_override").val("manifest_behaviors");
                $("[id$=Note]").text("Toolbar is attempting to print Pickup Report document for manifest id " + id + ".");
            } else {
                $("[id$=Warn]").text("Pickup Label is not supported for this carrier.  Contact support for assistance.");
            }
        }
        this.cancel_manifest=function(){
            shipment_id=$(this).data("id");
            var data_object={
                     "token": token,
                     "shipment_id": shipment_id };
            var res=confirm("Cancel this shipment?");
            if(res){
                ship_service("shipment_cancel",cancel_success,data_object);
            }
        }
        this.print_label=function () {
            shipment_id=$(this).data("id");

            if($("[id$=hftoolbarversioninfo]").val()==="0.0.0.0"){                   //no toolbar   
                var data_object=JSON.stringify({ group:'sys',method:'get_label',owner:'0',parameters:{"Titan_Parameter_ship_id":shipment_id}});
                load("api/lambda",build_labels,data_object)
            } else {
                $("[id$=hfShipmentIds]").val(shipment_id);       
                $("[id$=hfBHOBehaviors]").val("printlabel");                              //This is how we print to the toolbar
                $("#enr_toolbar_override").val("printlabel");

                if(document.fireEvent) {
                    document.getElementById("enr_toolbar_override").fireEvent('onchange');
                } else {
                    var event = document.createEvent("HTMLEvents");
                    event.initEvent("change",true,false);
                    document.getElementById("enr_toolbar_override").dispatchEvent(event);
                }//end fire event for toolbar
            }//end if toolbar installed
        }//end print label
        //-----------------------------
        this.build_shipments=function(json_results){
            if(!json_results ) return;
            var o="";
            var data={},column_index,_shipment_count=0;
            carrier=json_results.keys['Carrier'];
            count  =json_results.keys['count'];

            for(i in json_results.rows){
                data          =json_results.rows[i];
                carrier_name  =data[carrier];
                carrier_count =data[count];
                _shipment_count+=parseInt(carrier_count);
                o+="<td style='font-size:18px; padding-left: 10px; vertical-align:bottom;'>"+carrier_name+":</td><td style='text-align:left; font-size:18px; color:#000; width:50px; vertical-align:bottom;'>"+carrier_count+"</td>"
            }
            if(_shipment_count===0) {
                o="<td style='font-size:20px;padding-right:10px; vertical-align:bottom'>No Shipments</td><td style='font-size:20px; width:50px; padding-right:20px; vertical-align:bottom;'></td>";
            } else {
                o="<td style='font-size:20px;padding-right:10px; vertical-align:bottom'>Total Shipments</td><td style='font-size:20px; width:50px; padding-right:20px; vertical-align:bottom;'>:"+_shipment_count+"</td>"+o;
            }
            $("#shipment_line").html(o);
       }
        this.build_labels=function(json_results){
            var data={},column_index;
            
            var o="<style type='text/css'> .img {width :800px; } \
    .page {        \
       page-break-qfter: always}\
        width: 100%;                                       \
        padding: 0px;                                        \
        margin: 0px;                                    \
    }                                                         \
     @page {                                                  \
        size: A4;                                             \
        margin: 0;                                            \
    }                                                         \
    @media print {                                            \
        html, body {                                          \
           }                                                     \
        .page {                                               \
            margin: 0;                                        \
            border: initial;                                  \
            border-radius: initial;                           \
            width: initial;                                   \
            min-height: initial;                              \
            box-shadow: initial;                              \
            background: initial;                              \
            page-break-after: always;                         \
        }                                                     \
    }                                                         \
            </style>\
";
     


            index=0;    
            run="";
            var isGIF=false;
            var isPDF=false;
            var isZPL=false;
             for(i in json_results.rows){
               data=json_results.rows[i];
                if(data[0]==="ZPL" || data[1]==='EPL')        {
                    isZPL=true;
                }
            
                if(data[0]==="GIF") {
                    isGIF=true;
                    //o+='<div class="page"><img class="img" src="data:image/gif;base64,'+data[column_index]+'" /></div>';

                }
                var pdfAsDataUri ="";
                if(data[0]==="PDF") {
                    isPDF=true;
                    pdfAsDataUri = "data:application/pdf;base64,"+data[column_index];
                    //var w = window.open(pdfAsDataUri , '_blank', 'status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes,titlebar=yes,height=600,width=1000' );
                }
                if(data[0]==="HTML") {
                    pdfAsDataUri = "data:application/html;base64,"+data[column_index];
                    //var w = window.open(pdfAsDataUri , '_blank', 'status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes,titlebar=yes,height=600,width=1000' );
                }
            }
            if(isGIF){
              //  var w2 = window.open(pdfAsDataUri , '_blank', 'status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes,titlebar=yes,height=600,width=1000' );
              //  $(w2.document.body).html(o+'<script>function load() { '+run+'}</script>'+"<script  type='text/javascript'> window.onload=load(); </script>");
                 window.open("./legacy/printscreen.aspx?ShipId="+shipment_id+"&LabelType=GIF", '_blank', 'status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes,titlebar=yes,height=600,width=1000' );
              
            }
            if(isPDF){
              //  var w2 = window.open(pdfAsDataUri , '_blank', 'status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes,titlebar=yes,height=600,width=1000' );
              //  $(w2.document.body).html(o+'<script>function load() { '+run+'}</script>'+"<script  type='text/javascript'> window.onload=load(); </script>");
                 window.open("./legacy/printscreen.aspx?ShipId="+shipment_id+"&LabelType=PDF", '_blank', 'status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes,titlebar=yes,height=600,width=1000' );
              
            }
            if(isZPL){
                alert("You cannot print ZPL/EPL with the Web Print configuration. ");
                return;
            }
        }
        anchor_data_events();                                                           //we dont need to wait for the page to load to bind the events. saves so much time.
        return { 
            ship_service:ship_service,
            shipment_count:function () {
                var date_range=$("#Titan_Parameter_date").val();
                var data_object=JSON.stringify({ group:'manifest',method:'count',owner:'0',parameters:{"Titan_Parameter_date":date_range}});
                load("api/lambda",build_shipments,data_object)
            },
            set_JWT:function(data) { JWT=data; },
            set_data_object:function(data) { data_object=data; },
            show_info_detail:function(){
                id=$("#info-detail").data("id");
              $("#info-view").load("./legacy/shipment_detail.aspx?showdetail=1&mod=1&id="+id);
            },
            show_info_contents:function(){
                id=$("#info-contents").data("id");
                $("#info-view").load("./legacy/shipment_contents.aspx?showdetail=1&mod=1&id="+id);
            },
            show_info_status:function(){
                id=$("#info-status").data("id");
              $("#info-view").load("./legacy/shipment_status.aspx?showdetail=1&mod=1&id="+id);
            },
            show_info_track:function(){
                id=$("#info-track").data("id");
              $("#info-view").load("./legacy/shipment_track.aspx?showdetail=1&mod=1&id="+id);
            },
            close_manifest_control:function(manifest_div)
            {
                this.manifest_div=manifest_div;
                var data_object={
                         "token": token
                         };               
                ship_service("shipper_list_with_accounts",close_manifest_control_success,data_object);                
            },
            close_manifest:function(){
                var data=$("#close_manifest_id option:selected").val();
                var tokens=data.split("|");
                if(tokens.length<2) {
                    alert("Invalid carrier data.");
                    return;
                }
                var shipper_id=tokens[0];
                var account_no=tokens[1];

                var ship_service_object={'token':token,'shipper_id':shipper_id,'accountno':account_no}; //account_no shipper_id
                this.ship_service("shipment_finalize_all",titan_external.close_manifest_success,ship_service_object);
            },
            close_manifest_success:function(data){
                var jsonResults=XML2JSON(data);
                if(jsonResults.manifest.id==0) {
                    alert("Close Manifest Failed");
                } else {
                //    alert ("Close Manifest: Success");
                }
                var x=data;
                titan_external.close_manifest_control();                    
                titanDWS.reset();
            },
            print_manifest_control:function(manifest_div){
                this.manifest_div=manifest_div;
                var data_object={
                         "token": token
                         };               
                ship_service("manifest_list",print_manifest_control_success,data_object);                
            }
            




        }
    })();                                                                                //end titan external all variables forced to colsure, nothing to access externaly.

  

    titanDWS = (function () {
        var webServiceURL = $("[id$=hfWebService]").val();
        var m = {};
        var paramDiv = "";
        var resultsDiv = "";
        var calendar = "";
        var titanAjaxObject = {};
        data_object={};
        var JWT="";
        var titan_loaded=false;

        var padd = function (d, len) {
            var o = "";
            for (a = d.length; a < len; a++) o += "_";
            return d + o;
        }

        
        var load=function(method,success_func){
        //showAjax();
            $.ajax({
            type: "POST", url: webServiceURL +"/"+ method, data:data_object, headers:{'JWT':JWT},
            success: function(results){
                        //hideAjax();
                        if(success_func){
                            success_func(results);
                        }
                }, error: this.error, dataType: "json"
            });
        }

        var update_data=function(){
            $("#titanClient").trigger('pagerUpdate');                              //update pager
            $("#titanClient").trigger('Update');                              //update pager
            api_out();
            };        
        var token_success = function (json_result) {
            if(json_result) {
                JWT=json_result;
                titan_external.set_JWT(JWT);
                load("api/fetch_method", fetch_success);   
            }
        };

        var get_token=function(){
            data_object=generateTitanAjaxObject();          //json post
            titanAjaxObject=data_object;                    //tablesorter
            load("api/get_token", token_success);   
        }


        var fetch_success = function (jsonResult) {
            m = jsonResult.results;
            method=m;

            buildReport(m);
            if (m.parameters.length === 0 || m.auto_load===true) {                                          //autoload if no input needed
                titanDWS.loadData()
            }
            document.title = m.title;
            initTableSorter();
        };

        //this.get_ajax=function {}
        var buildReport = function (m) {
            var injectTargetThead = "{$thead}";
            var injectTargetTfoot = "{$tfoot}";
            var injectTargetName = "{$name}";
            var injectTargetDesc = "{$desc}";
            var injectTargetComboSearch = "{$combined_search}";
            var injectTargetParameters = "{$parameters}";
            var params = "";
            var thead = "";
            var tfoot = "";
            if (!m) {
                alert("Not a valid Report");
                return;
            }
            filterDefaults=[];
            for (var index in m.columns) {
                if (!m.columns[index].visible) continue;
                thead += "<th ";
                if (!m.columns[index].filter) thead += "data-filter=\"false\" ";
                if (!m.columns[index].sort) thead += "data-sorter=\"false\" ";
                if ( m.columns[index].filter && m.columns[index].selectOptions.length>0) {      //if filter and has select options
                    thead +=" class=\"filter-select\" " ;
                }
                if(m.columns[index].selectOptions.length>0){
                    for(oindex in m.columns[index].selectOptions){
                        if(m.columns[index].selectOptions[oindex]._default){
                            thead+="data-value=\""+m.columns[index].selectOptions[oindex].value+"\"";
                            filterDefaults[index]=m.columns[index].selectOptions[oindex].value;
                            }
                    }
                }
                name = m.columns[index].name;
                if (m.columns[index].alias !== "") name = m.columns[index].alias;
                thead += ">" + name + "</th>";
                tfoot += "<td>" + name + "</td>";
            }

            var glyph="glyphicon glyphicon-pencil";
            var type="";
            var isHidden=false;
            for (index in m.parameters) {
                if(m.parameters[index].type==="hidden") {
                    isHidden=true;
                    continue;
                }
                if(m.parameters[index].type==='date') glyph="glyphicon-calendar";

                params += "<tr>"; //<td>" + m.parameters[index].display + "</td>
                params += "<td title='"+ m.parameters[index].desc+"'><div class='titan_parameter_box input-group'>    <span class='input-group-addon titan-param-name' ><i class='glyphicon "+glyph+"'></i>&nbsp;"+ m.parameters[index].display+"</span><input id=\"" + m.parameters[index].htmlName + "\" class=\"form-control  ";
                if (m.parameters[index].type === "date") params += "titan_date ";
                if (m.parameters[index].type === "daterange") params += "titan_date_range ";
                var _default="";
                if(m.parameters[index].type!=="date") {
                    _default=m.parameters[index]._default;
                } 
                params += "\" type=\"text\" value=\""+_default+"\" /></div></td>";
                params += " </tr>";
            }

            if(isHidden){
                params += "<tr><td colspan=2>";
                for (index in m.parameters) {
                    if(m.parameters[index].type!=="hidden") continue;
                    params += "<input type=\"hidden\" id=\"" + m.parameters[index].htmlName + "\" value=\""+_default+"\" />";
                }
                params += "</td> </tr>";
            }

            //For Group by..... name.alias.htmlgroup
            // for the love of smething... lets get the pivot table stuff somewhere else.
            var aggregate = "";
            if (m.aggregates && m.aggregates.length > 0) {
                aggregate += "<tr><td><button type='button' class='titan_activate_groups'>Group</button></td><td><div class='titan_aggregates'><div class='titan_group_list'>";

                for (index in m.aggregates) {
                    aggregate +=
                                       "<div class='titan_aggregate titan_fl titan_ml'><div class='titan_left squaredOne'>" +
                                       "<input type='checkbox' class='form-control 'id='" + m.aggregates[index].htmlName + "' />" +
                                       "<label for='" + m.aggregates[index].htmlName + "'></label>" +
                                       "</div><div class='titan_label'>" + m.aggregates[index].display + "</div></div>";
                }
                aggregate += "</div></div><div class='titan_group_order'></div></td></tr>";
            }
            //params += aggregate;
            var tableWidth = "<style type='text/css'>\n\r";
            tableWidth += ".tablesorter {width: 100%;}\n\r";
            var i=0;
            for ( index in m.columns) {
                if (!m.columns[index].visible) continue;
                if (m.columns[index].width === "") continue;
                tableWidth += ".tablesorter td:nth-of-type(" + (parseInt(i)+1) + ") {";
                if(m.columns[index].fixed_width!==true) tableWidth += "max-width: " + m.columns[index].width + "px;"
                if(m.columns[index].width!=="0") {
                    tableWidth += "width: " + m.columns[index].width + "px;";
                }
                tableWidth += "}\r\n";
                i++;
            }
            tableWidth += "</style>"
            if(m.combined_search) {
                m.template.report=m.template.report.replace(injectTargetComboSearch,
                '<div class="input-group"><div class="input-group-addon"><i class="nc-icon-mini ui-1_zoom"></i></div>\
                <input id="multi_search" class="form-control search " type="text" placeholder="Search" /></div>');
            } else {
                if(null!==m.template && null!==m.template.report){
                    m.template.report=m.template.report.replace(injectTargetComboSearch,'');
                }
            }
            if(null!==m.template ){
                if(null!==m.template.report){
                    m.template.report =tableWidth + m.template.report.replace(injectTargetThead, thead);
                    m.template.report = m.template.report.replace(injectTargetTfoot, tfoot);
                }
                if(null!==m.template.parameters){
                    m.template.parameters = m.template.parameters.replace(injectTargetName, m.name);
                    $(resultsDiv).html(m.template.report);
                    m.template.parameters = m.template.parameters.replace(injectTargetDesc, m.desc);
                    m.template.parameters = m.template.parameters.replace(injectTargetParameters, params+aggregate);
                    $(paramDiv).html(m.template.parameters);                            //inject into page
                }
            }

            if (params.length + aggregate.length === 0) {                      //hide parameter if nothing to do
                $(".titan_report_params").hide();
            }
            //$(".titan_export").html("<a href='"+m.export_link+"'><i class='nc-mini arrows-2_square-upload'></i></a>")
            $(".titan_activate_groups").click(function(){
                $(".titan_aggregates").dialog({ title: "Group By", width:'700px',modal: true, draggable: false });
            });

            reset_date_range();

            $(".titan_date").datepicker();
            for (index in m.parameters) {
                if(m.parameters[index].type==="date") {
                    _default=m.parameters[index]._default;
                    $("#"+m.parameters[index].htmlName).datepicker("setDate",_default); 
                } 
            }
            titanDWS.api_out();
            if(m.auto_load) titanDWS.loadData(generateTitanAjaxObject());
            //$("#titanClient").trigger('filterResetSaved');

        }
   
        var reset_date_range=function(){
            var start = moment().subtract(7, 'days');
            var end = moment();
            function cb(start, end) {
                $('.titan_date_range span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));//.promise().done(update_data);
                setTimeout(function(){ titanDWS.update_data(); }, 200); //html not available asap?

            }
            $('.titan_date_range ').daterangepicker({
                locale: {
                  format: 'MM/DD/YYYY'
                },
                "opens": "left",
                startDate: start,
                endDate: end,
                ranges: {
                   'Today': [moment(), moment()],
                   'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                   'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                   'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                   'This Month': [moment().startOf('month'), moment().endOf('month')],
                   'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);

            cb(start, end);
        }
        var calendar_success= function (jsonResult) {
            results= jsonResult.results;
            rows=results.rows;
            var head=results.columns;
            var dateIndex=0;
            var date=date;
            var value="";

            for(column in head) {
                if(head[column].name==="date") dateIndex=column;
            }
                    
            for(row in rows) {
                for(column in rows[row]) {
                    date=rows[row][dateIndex];
                    value=rows[row][column];
                    switch(head[column].name) {
                        case 'c1': $('.day[data-date="'+date+'"] > .c1').html(value); break;
                        case 'c2': $('.day[data-date="'+date+'"] > .c2').html(value); break;
                        case 'c3': $('.day[data-date="'+date+'"] > .c3').html(value); break;
                        case 'c4': $('.day[data-date="'+date+'"] > .c4').html(value); break;
                        case 'c5': $('.day[data-date="'+date+'"] > .c5').html(value); break;
                        case 'c6': $('.day[data-date="'+date+'"] > .c6').html(value); break;
                        case 'c7': $('.day[data-date="'+date+'"] > .c7').html(value); break;
                        case 'c8': $('.day[data-date="'+date+'"] > .c8').html(value); break;
                        case 'c9': $('.day[data-date="'+date+'"] > .c9').html(value); break;
                    }
                }
            }
        };
   
        var initTableSorter = function () {
            //Ajax tablesorter init
            var filter_object={};
            for (var index in m.columns) {
                if (!m.columns[index].visible) continue;

                if ( m.columns[index].filter && m.columns[index].selectOptions.length>0) {      //if filter and has select options
                    filter_object[index]=[];
                    var selectObject={};
                    for(oindex in m.columns[index].selectOptions){
                        var display=m.columns[index].selectOptions[oindex].display;
                        var value=m.columns[index].selectOptions[oindex].value;
                        var key=display;                                                        //todo for future update. make display value work! not supported in tablesorter.
                        selectObject[key]=display;
                    }
                    filter_object[parseInt(index)]=selectObject;
                }
           }//end index
            $("#titanClient").tablesorter({
                theme: "table",
                widthFixed: true,
                widgets: ["filter", "zebra"],
                widgetOptions: {
                    zebra: ["even", "odd"],
                    filter_reset: ".reset",
                    filter_functions:filter_object,
                    filter_saveFilters : true
                },
            })
            .tablesorterPager({
                container: $(".pager"),
                ajaxUrl: webServiceURL + "/" + "api/lambda",
                customAjaxUrl: function (table, url) {
                    var obj = table.config.pager.ajaxObject;
                    var page = table.config.pager.page;
                    var pageLength = table.config.pager.size;
                    var sort = [];
                    var filter = [];
                    var key, data, item;
                    var dir="";
                    sortListTemp=table.config.sortList;
                    for (item in table.config.sortList) {

                        key  = table.config.sortList[item][0];
                        data = table.config.sortList[item][1];
                        if(method.new_columns) {                                                        //columns may have changed use that set
                            for(index in method.new_columns) {
                                dir="";
                                if(data===1) dir="DESC";
                                if(data===0) dir="ASC";
                                if(key===parseInt(index)) sort.push([method.new_columns[index].name, dir]);
                            }
                        } else {                                                                       //use origonal column set
                            for(index in method.columns) {
                                dir="";
                                if(data===1) dir="DESC";
                                if(data===0) dir="ASC";
                                if(key===parseInt(index)) sort.push([method.columns[index].name, dir]);
                            }
                        }
                    }
               
                    for (item in table.config.lastSearch) {
                        key = item;
                        data = table.config.lastSearch[item];
                        if (data.trim() === "") continue;
                        if(method.new_columns) {
                            for(index in method.new_columns) {
                                if(key===index) filter.push([method.new_columns[index].name, data]);
                            }
                        }else {
                            for(index in method.columns) {
                                if(key===index) filter.push([method.columns[index].name, data]);
                            }
                        }
                    }
                    var dataObj = titanAjaxObject;
                    
                    if (titanAjaxObject.parameterless === false) {
                        titanAjaxObject.parameters = {};
                        $('[id^=Titan_Parameter_]').each(function () {
                            titanAjaxObject.parameters[this.id] = this.value;
                        });
                    }
                        titanAjaxObject.aggregates = {};
                        $('[id^=Titan_Aggregate_]').each(function () {
                            if(this.checked)   titanAjaxObject.aggregates[this.id] = this.checked;
                        });
                    
                    titanAjaxObject.aggregates = {};
                    titanAjaxObject.parameters['multi_search']=$("#multi_search").val();
                       

                    dataObj.page = page;
                    dataObj.pageLength = pageLength;
                    dataObj.sort = sort;
                    dataObj.filters = filter;

                    obj.data = JSON.stringify(dataObj);
                    table.config.pager.ajaxObject = obj;  //?
                    return url;
                },
                ajaxError: null,
                ajaxObject: {
                    contentType: "application/json",
                    method: "POST",
                    dataType: 'json',
                    headers:{'JWT':JWT}
                },
                //This is the RETURN function to process the results from the ajax call for the tablesorter.
                ajaxProcessing: function (data) {
                    if (data && data.hasOwnProperty('results')) {
                        data = data.results;
                        if(!data) return;
                        if(data.export_link!=='' && data.export_id!=='0') $(".titan_export").html(data.export_link);
                        var index, r, row, c, d = data.rows,
                        total = data.total_rows,
                        rows = [],
                        len = d.length;
                        for (r = 0; r < len; r++) {
                            row = []; // new row array
                            index = 0;
                            for (c in d[r]) {
                                row[index] = "<span>" + d[r][c] + "</span>";
                                index++;
                            }
                            rows.push(row); // add new row array to rows array
                        }
                        var rebuild=false;
                        if(method.new_columns && data.columns.length!==method.new_columns.length) rebuild=true;
                        //else
                        //if(method.columns.length!=data.columns.length) rebuild=true;
                        
                        if(rebuild){            //only redo the header if the columncount changes. causes odd sorting behvior
                            $("#titanClient thead tr").remove();
                            $("#titanClient tfoot tr").remove();
                            tr = "<tr>";
                            for (index in data.columns_display) { tr += "<th>" + data.columns[index] + "</th>"; }
                            tr += "</tr>";
                            $("#titanClient thead").html(tr);
                            //table.config.sortList=sortListTemp;
                            $("#titanClient").trigger('filterReset');
                            $("#titanClient").trigger('sortReset');         //reset sort and filter
                            $("#titanClient").trigger('pageAndSize', [1, 10]);                     //reset pagination and size of pages
                            $("#titanClient").trigger("updateAll");
                           // $("#titanClient").trigger('pagerUpdate');                              //update pager


                        }
                         method.new_columns=data.columns;
                        var cA=[];
                        for(var i in data.columns) cA.push(data.columns[i].display);
                        return [data.total_rows, rows, cA];
                    }
                },
                processAjaxOnInit: true,
                output: '{startRow} to {endRow} ({totalRows})',
                updateArrows: true,
                page: 0,
                size: 10,
                savePages: true,
                storageKey: 'tablesorter-pager',
                pageReset: 0,
                fixedHeight: false,
                removeRows: false,
                countChildRows: false,
                cssNext: '.next',
                cssPrev: '.prev',
                cssFirst: '.first',
                cssLast: '.last',
                cssGoto: '.gotoPage',
                cssPageDisplay: '.page_display',
                cssPageSize: '.page_size',
                cssDisabled: 'disabled',
                cssErrorRow: 'tablesorter-errorRow'
            });
           //  $('titanClient#').filter.buildSelect( table, column, result, true );
        }//end load data...
   
        return {
            JWT:JWT,
            loadCalendar:function(_calendar,_titanAjaxObject){
                ajaxUrl: webServiceURL + "/" + "api/lambda"
                titanAjaxObject = _titanAjaxObject;
                calendar=_calendar;
                $.ajax({
                    type: "POST", url: webServiceURL +"/"+ "api/lambda",   contentType:"application/json; charset=utf-8",data: JSON.stringify(_titanAjaxObject), success: calendar_success, error: this.error, dataType: "json"
                });             
            },
            reset:function(){
                $("#multi_search").val('');     //update multi search
                reset_date_range();      

                $("#titanClient").trigger('sortReset');         //reset sort and filter
                $.tablesorter.setFilters( $("#titanClient"), filterDefaults, true );
                $("#titanClient").trigger('pageAndSize', [1, 10]);                     //reset pagination and size of pages
                $("#titanClient").trigger('pagerUpdate');                              //update pager
                $("#titanClient").trigger('Update');                                   //update pager
            },
            loadData:function () {
                $(".titanData").show();
                titanDWS.update_data();
            },
            on_load:function(func){
                titanDWS.load_run=func;
            },
            api_out:function(){
                if(titanDWS.load_run) titanDWS.load_run();
            },
            loadReport :function (_paramDiv, _resultsDiv) {
                titan_loaded=true;
                //titanAjaxObject = _titanAjaxObject;
                //data_object=titanAjaxObject;
                paramDiv = _paramDiv;
                resultsDiv = _resultsDiv;
                get_token();
            },
            update_data:function(){
                $("#titanClient").trigger('pagerUpdate');                              //update pager
                $("#titanClient").trigger('Update');                              //update pager
                titanDWS.api_out();
            }        
        }
    })() //end titanDWS Client (encapsulate and run)
});