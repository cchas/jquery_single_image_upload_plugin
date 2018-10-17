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
                'network_error' : 'Error when connecting to server',
                'upload_success': 'File uploaded successfully',
                'upload_processing': 'Processing file...',
                'upload_error': 'Error when uploading',
                  
            },
            template_html: function(id, src){

                return [

                    '<div class="' , id , '_wrapper">',

                      '<div class="thumbnail_image vertical-center">',
                      
                        '<input type="file" accept="image/*" id="' , id , '" data-filename="" />',
                        '<img src="' , src , '" id="thumbnail_' , id , '" />',
                        
                        '<div class="thumbnail_buttons">',
                            '<a href="#" class="clear_image"><i class="fa fa-trash"></i></a>',
                        '</div>',

                        '<span id="' , id , '_message" class="status"></span>',

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

            var link_clear_image = targetObj.find('a.clear_image');
            
            link_clear_image.click(function(e){ 
                  
                clear_image( e, targetObj );

            });

            return this;

        });


        function update_data_filename(targetObj, filename){

            targetObj.find('input[type=file]').attr('data-filename', filename);
        
        }

        function show_clear_button( targetObj ){

            targetObj.find('a.clear_image').show();
        
        }

        function hide_clear_button( targetObj ){

            targetObj.find('a.clear_image').hide();
        
        }

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
            
            update_data_filename(targetObj, '');
            hide_clear_button(targetObj);
            clear_message( targetObj );

        }

        function set_template( targetObj, settings ){
            
            var src = '';

            if( settings.url_default_image.length > 4 && settings.url_default_image.indexOf('//') > -1 ){
                src = settings.url_default_image;
            }

            var template = settings.template_html(settings.id, src);

            targetObj.html( template );

            if( settings.url_default_image == '' || settings.url_default_image.length < 4 ){
                
                hide_clear_button( targetObj );
                
            }

        };

        function show_spinner( objImg ){

            clear_thumbnail( objImg );

            window.setTimeout(function(){

                objImg.attr('src', settings.url_spinner)
                        .css('z-index', 3000)
                        .show();

            }, 500);

        }

        function update_thumbnail( id, file ){

            var objImg = $('#thumbnail_' + id);

            show_spinner( objImg );

            window.setTimeout(function(){

                objImg.attr('src', file);
                update_message( id, 'success', lang.upload_success );
                
                var targetObj = $('#' + id ).closest('div.thumbnail_image');
                show_clear_button(targetObj);

            }, 2000);

        } // end update_thumbnail

        function update_message( id, status_class, message ){

            $('#' + id ).closest('div.thumbnail_image')
                        .find('span.status')
                        .removeClass( 'info success danger warning error' )
                        .addClass( status_class )
                        .text( message || '...' );
            
        }

        function clear_message( targetObj ){

            targetObj.find('span.status')
                    .text('')
                    .removeClass('info success danger warning error');

        }

        function clear_thumbnail( targetObj ){

            targetObj.attr( 'src', '');
            
            targetObj.closest('div.thumbnail_image').removeClass('error');

            clear_message( targetObj );

        }

        function process_run_file_upload( id, file, fd ){

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
                        
                        // $('#' + id ).attr('data-filename', filename);

                        var targetObj = $('#thumbnail_' + id );
                        
                        update_data_filename(targetObj, filename);
                        update_thumbnail( id, file );
                        
                    }else{

                        $('#' + id ).closest('div.thumbnail_image')
                                    .addClass('error')
                                    .show();

                        update_message( id, 'error', lang.upload_error + ': ' + obj_json.error );
                        console.log( lang.upload_file_error + obj_json.error );

                    }

                }

            });


            resp.fail(function() {

                console.log( lang.network_error );
                return false;
            
            });

            return resp;

        }

        function run_file_upload( file, id, field_name ){

            var fd        = new FormData(),
                targetObj = $('#thumbnail_' + id ),
                blobFile  = $('#' + id).get(0).files[0],
                filename  = id + '.jpg';

            var fsize = blobFile.size;

            clear_thumbnail( targetObj );
            update_message( id, 'info', lang.upload_processing );

            fd.append(field_name, blobFile, filename );

            $.each( settings.data, function(index, value){
                
                fd.append( index, value );

            });

            process_run_file_upload( id, file, fd );

        } // end run_file_upload


    } // end plugin


}(jQuery));