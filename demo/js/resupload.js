;(function($) {

    $.fn.resupload = function( options ) {

        var settings = $.extend({
            id           : '',

            url_spinner  : 'img/spinner.gif',
            url_upload   : 'upload.php',
            url_default_image: '',
            field_name : 'upl',
            data: {},
            lang: {
                'init_error': 'Error when initializing plugin',
                'upload_file_error' : 'Error when uploading file: ',
                'network_error' : 'Error when connecting to server'
            },
            template_html: function(id, src){

                return [

                    '<div class="' , id , '_wrapper">',

                      '<div class="thumbnail_image vertical-center">',
                      
                        '<input type="file" accept="image/*" id="' , id , '" data-filename="" />',
                        '<img src="' , src , '" id="thumbnail_' , id , '" />',
                        
                        '<div class="botones_thumbnail">',
                            '<a href="#" class="clear_image"><i class="fa fa-trash"></i></a>',
                        '</div>',
                      '</div>',

                    '</div>',

                ].join('');

            }

        }, options);

        var esto = this,
            lang = settings.lang;

        return this.each( function() {
            
            var targetObj = $(this);

            set_template( targetObj, settings);

            if( 
                settings.url_upload == '' || 
                settings.id == '' 
            ){
                
                targetObj.html( alert_error('init_error') );
                return false;
            
            }


            /* evento subida de archivo */
            var objInputFile = targetObj.find('input[type="file"]');

            objInputFile.change(function(e){ 

                e.preventDefault();
                  
                var file = URL.createObjectURL( objInputFile.get(0).files[0] ),
                      id = settings.id;

                run_file_upload( file, id, settings.field_name );

            });

            var enlace_clear_image = targetObj.find('a.clear_image');
            
            enlace_clear_image.click(function(e){ 
                  
                clear_image( e, targetObj );

            });

            return this;


        });


        function alert_error( errorId ){
            
            return [
                '<div class="alert alert-danger">',
                    '<a href="#" class="close" data-dismiss="alert" aria-label="close" tabindex="9999">×</a>',
                    '<div class="alert-content">',
                        '<i class="fa fa-exclamation-circle fa-2x"></i> &nbsp;',
                        lang.errorId,
                    '</div>',
                '</div>'
            ].join('');
        
        }

        function clear_image( e, targetObj ){

            e.preventDefault();

            targetObj.find('div.thumbnail_image img').attr('src', '');
            targetObj.find('div.thumbnail_image input[type=file]').attr('data-filename', '');

            targetObj.find('a.clear_image').hide();

        }

        function set_template( targetObj, settings ){
            
            var src = '';
            if( settings.url_default_image && settings.url_default_image.indexOf('//') > -1 ){
                src = settings.url_default_image;
            }else{
                targetObj.find('a.clear_image').hide();
            }

            var template = settings.template_html(settings.id, src);

            targetObj.html( template );

        };

        function poner_cargador( objImg ){

            clear_thumbnail( objImg );

            window.setTimeout(function(){

                objImg.attr('src', settings.url_spinner)
                        .css('z-index', 3000)
                        .show();

            }, 500);

        }

        function update_thumbnail( id, file ){

            var objImg = $('#thumbnail_' + id);

            poner_cargador( objImg );

            window.setTimeout(function(){

                objImg.attr('src', file);
                
            }, 2000);

        } // end update_thumbnail


        function clear_thumbnail( targetObj ){

            targetObj.attr( 'src', '');
            
            targetObj.closest('div.thumbnail_image').removeClass('error');

        }

        function run_file_upload( file, id, field_name ){

            var fd        = new FormData(),
                targetObj = $('#thumbnail_' + id ),
                blobFile  = $('#' + id).get(0).files[0],
                filename  = id + '.jpg';

            var fsize = blobFile.size;

            clear_thumbnail( targetObj );

            fd.append(field_name, blobFile, filename );

            $.each( settings.data, function(index, value){
                
                fd.append( index, value );

            });

            var resp = $.ajax({
                url: settings.url_upload,
                type: 'POST',
                data: fd,
                cache: false,
                contentType: false,
                processData: false
            });

            resp.done(function(obj_json) {

                if( typeof obj_json == 'string' ){
                  obj_json = $.parseJSON( obj_json );
                }

                if (obj_json !== null) {

                    if( obj_json.status == 'ok' || obj_json.status == 'success' ){

                        filename = obj_json.nombre_archivo;    
                        
                        $('#' + id ).attr('data-filename', filename);
                        $('#' + id ).closest('div.thumbnail_image').find('a.clear_image').show();

                        update_thumbnail( id, file );
                        
                    }else{

                        // clear_thumbnail( targetObj );
                        $('#' + id ).closest('div.thumbnail_image')
                                    .addClass('error')
                                    .show();

                        console.log( lang.upload_file_error + obj_json.error );

                    }

                }

            });


            resp.fail(function() {

                console.log( lang.network_error );
                return false;
            
            });

        } // end run_file_upload


    } // end plugin


}(jQuery));