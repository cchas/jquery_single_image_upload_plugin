;(function($) {

    $.fn.resupload = function( options ) {

        var settings = $.extend({
            id           : '',
            url_spinner  : 'http://localhost/sanjuan2/img/spinner.gif',
            url_upload   : '',
            url_default_image: '',
            data: {},
            lang: {
                'error_inicio': 'Error al iniciar el componente. Consulte con soporte técnico.'
            }

        }, options);

        var esto = this;

        return this.each( function() {
            
            var targetObj = $(this);

            establecer_template( targetObj, settings);

            if( 
                settings.url_upload == '' || 
                settings.id == '' 
            ){
                
                console.log('No existen parámetros obligatorios');
                targetObj.html( alert_error('error_inicio') );
                return false;
            
            }


            /* evento subida de archivo */
            var objInputFile = targetObj.find('input[type="file"]');

            objInputFile.change(function(e){ 

                e.preventDefault();
                  
                var file = URL.createObjectURL( objInputFile.get(0).files[0] ),
                      id = settings.id;

                procesar_subir_archivo( file, id );

            });

            /* evento eliminar enlace */
            var enlace_eliminar_imagen = targetObj.find('a.eliminar_imagen');
            enlace_eliminar_imagen.click(function(e){ 
                  
                eliminar_imagen( e, targetObj );

            });

            return this;


        });


        function alert_error( errorId ){
            
            return [
                '<div class="alert alert-danger">',
                    '<a href="#" class="close" data-dismiss="alert" aria-label="close" tabindex="9999">×</a>',
                    '<div class="alert-content">',
                        '<i class="fa fa-exclamation-circle fa-2x"></i> &nbsp;',
                        settings.lang[ errorId ],
                    '</div>',
                '</div>'
            ].join('');
        
        }

        function eliminar_imagen( e, targetObj ){

            e.preventDefault();

            targetObj.find('div.thumbnail_image img').attr('src', '');
            targetObj.find('div.thumbnail_image input[type=file]').attr('data-filename', '');

            targetObj.find('a.eliminar_imagen').hide();

        }

        function establecer_template( targetObj, settings ){
            
            var src = '';
            if( settings.url_default_image && settings.url_default_image.indexOf('//') > -1 ){
                src = settings.url_default_image;
            }else{
                targetObj.find('a.eliminar_imagen').hide();
            }

            var template = [

                '<div class="caja_' , settings.id , '">',

                  '<div class="thumbnail_image vertical-center">',
                  
                    '<input type="file" accept="image/*" id="' , settings.id , '" data-filename="" />',
                    '<img src="' , src , '" id="thumbnail_' , settings.id , '" />',
                    
                    '<div class="botones_thumbnail">',
                        '<a href="#" class="eliminar_imagen"><i class="fa fa-trash"></i></a>',
                    '</div>',
                  '</div>',

                '</div>',

            ].join('');

            targetObj.html( template );

        };

        function poner_cargador( objImg ){

            limpiar_thumbnail( objImg );

            window.setTimeout(function(){

                objImg.attr('src', settings.url_spinner)
                        .css('z-index', 3000)
                        .show();

            }, 500);

        }

        function actualizar_thumbnail( id, file ){

            var objImg = $('#thumbnail_' + id);

            poner_cargador( objImg );

            window.setTimeout(function(){

                objImg.attr('src', file);
                
            }, 2000);

        } // fin actualizar_thumbnail


        function limpiar_thumbnail( targetObj ){

            targetObj.attr( 'src', '');
            
            targetObj.closest('div.thumbnail_image').removeClass('error');

        }

        function procesar_subir_archivo( file, id ){

            var fd        = new FormData(),
                targetObj = $('#thumbnail_' + id ),
                blobFile  = $('#' + id).get(0).files[0],
                filename  = id + '.jpg';

            var fsize = blobFile.size;

            limpiar_thumbnail( targetObj );

            fd.append('upl', blobFile, filename );

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

                        console.log(obj_json, 'obj_json');

                        filename = obj_json.nombre_archivo;    
                        
                        console.log(filename, 'filename');

                        $('#' + id ).attr('data-filename', filename);
                        $('#' + id ).closest('div.thumbnail_image').find('a.eliminar_imagen').show();

                        actualizar_thumbnail( id, file );
                        
                    }else{

                        // limpiar_thumbnail( targetObj );
                        $('#' + id ).closest('div.thumbnail_image').addClass('error').show();

                        console.log('Error al subir el archivo: ' + obj_json.error );

                    }

                }

            });


            resp.fail(function() {
                console.log('Falló la conexión con el servidor');
                return false;
            });

        } // fin procesar_subir_archivo


    } // fin plugin


}(jQuery));