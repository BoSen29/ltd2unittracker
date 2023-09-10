$headers = @{
    "x-api-key" = get-content apikey.txt
}

$baseuri = "https://apiv2.legiontd2.com/"

$data = Invoke-RestMethod -uri "$($baseuri)units/byName/harpy" -Headers $headers -Method Get
Write-Host "GAME VERSION " + $data.version

if ($data.version) {

    $units = Invoke-RestMethod -Uri "$($baseuri)units/byVersion/$($data.version)?limit=250" -Headers $headers -Method GET
    $units += Invoke-RestMethod -Uri "$($baseuri)units/byVersion/$($data.version)?limit=250&offset=250" -Headers $headers -Method GET
    
    $abilities = @()

    # todo, implement proper calculations of the total amount of abilities... 
    0..7 | ForEach-Object {
        $abilities += Invoke-RestMethod -Uri "$($baseuri)info/abilities/$($_ * 50)/50" -Headers $headers -Method GET -ErrorAction SilentlyContinue
    }

    $abilities | ForEach-Object {
        Set-Content -Path "$($_._id).json" -Value ($_ | ConvertTo-Json -Depth 4)
    }

    $units | ForEach-Object {
        $ab = $_.abilities | ConvertTo-Json | ConvertFrom-Json
        $_.abilities = @()
        foreach ($ability in $ab) {
            Write-Host $abilitiy
            $_.abilities += ($abilities | Where-Object {$_._id -eq $ability})
        }
        Set-Content -path "$($_.unitId).json" -Value ($_ | ConvertTo-Json -Depth 4)
    }
}
