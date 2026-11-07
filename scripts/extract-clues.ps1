Add-Type -AssemblyName System.IO.Compression.FileSystem
$root=Split-Path $PSScriptRoot
$z=[IO.Compression.ZipFile]::OpenRead((Join-Path $root 'data/CLUES-202609.xlsx'))
try {
$r=[IO.StreamReader]::new($z.GetEntry('xl/sharedStrings.xml').Open()); [xml]$strings=$r.ReadToEnd(); $r.Close()
$r=[IO.StreamReader]::new($z.GetEntry('xl/worksheets/sheet1.xml').Open()); [xml]$sheet=$r.ReadToEnd(); $r.Close()
$ss=@($strings.sst.si | ForEach-Object { $_.InnerText })
$header=$true
$rows=@(foreach($row in $sheet.worksheet.sheetData.row){
 if($header){$header=$false;continue}
 $v=@{}; foreach($c in $row.c){$col=$c.r -replace '\d','';$v[$col]=if($c.t -eq 's'){$ss[[int]$c.v]}else{[string]$c.v}}
 # Solo datos del establecimiento; se omiten RFC, teléfonos y comentarios.
 ,@($v.A,$v.R,$v.C,$v.BH,$v.BI,$v.AY,$v.L,$v.AD,$v.O,(@($v.V,$v.W,$v.AA,$v.G,$v.E) -join ', '),$v.D)
})
[IO.File]::WriteAllText((Join-Path $root 'data/clues-raw.json'),(ConvertTo-Json -InputObject $rows -Depth 4 -Compress),[Text.UTF8Encoding]::new($false))
Write-Output ('Registros leídos: '+$rows.Count)
} finally {$z.Dispose()}
