@echo off
echo Starting weather app server...
echo Open your browser to: http://localhost:8000
timeout /t 2
start http://localhost:8000
powershell -NoProfile -Command "cd '%CD%'; $listener = [System.Net.HttpListener]::new(); $listener.Prefixes.Add('http://localhost:8000/'); $listener.Start(); Write-Host 'Server running on http://localhost:8000'; while($true) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $path = $request.Url.LocalPath; if($path -eq '/') { $path = '/index.html' }; $file = Join-Path '%CD%' $path.TrimStart('/'); if(Test-Path $file -PathType Leaf) { [byte[]]$buffer = [System.IO.File]::ReadAllBytes($file); $response.ContentLength64 = $buffer.Length; $output = $response.OutputStream; $output.Write($buffer, 0, $buffer.Length); $output.Close() } else { $response.StatusCode = 404; $response.OutputStream.Close() } }"
pause
