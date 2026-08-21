<?php

return [
    'python_path' => env('PDF_EXTRACTOR_PYTHON', 'python3'),
    'max_upload_kb' => (int) env('CONTENT_MAX_UPLOAD_KB', 38912),
    'chunk_size' => 900,
    'chunk_overlap' => 120,
];
