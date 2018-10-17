<?php
	
	/***********************************************************************************
		
		** WARNING **

	  	THIS IS ONLY AN EXAMPLE SCRIPT. THE SECURITY IS VERY LOW. USE YOUR OWN SCRIPT.

	**********************************************************************************/

	error_reporting(0);

	$field_name = 'upl'; // must be the same than field_name option when initializing plugin
	$max_file_size = 1000000;
	$upload_folder = __DIR__ . '/uploads/'; 

	$uploaded_file_name      = $_FILES[ $field_name ]['name'];
	$uploaded_file_temp_name = $_FILES[ $field_name ]['tmp_name'];
	$uploaded_file_size      = $_FILES[ $field_name ]['size'];

	
	if( 
		isset($_FILES[ $field_name ]) && 
		$_FILES[ $field_name ]['error'] == 0
	){

		// VALIDATION
		if( $uploaded_file_size > $max_file_size ){

			echo json_encode(
				array(
					'status' => 'ko',
					'error'  => 'File too big'

				)
			);
			exit;

		}

		// FILE UPLOADING
		$result_move = move_uploaded_file( $uploaded_file_temp_name, $upload_folder . $uploaded_file_name );

		if( $result_move ){

			echo json_encode(
				array(
					'status'  => 'ok',
					'message' => 'Image uploaded successfully.'
				)
			);
			exit;

		}

	}

	echo json_encode(
		array(
			'status' => 'ko',
			'error'  => 'Unknown error'

		)
	);

	

?>