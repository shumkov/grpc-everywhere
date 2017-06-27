<?php

$bodyJson = file_get_contents('php://input');

$body = json_decode($bodyJson, true);

echo json_encode([
    'isSuccess' => true,
    'message' => [
        'message' => "I receive {$_GET['requestMessageName']} and should respond {$_GET['responseMessageName']}",
    ],
]);

//echo json_encode([
//    'isSuccess' => false,
//    'error' => [
//        'message' => "Error",
//        'code' => 5,
//    ]
//]);
