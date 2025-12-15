Write-Host "`n=================================================="
Write-Host " 🚀 SUPER FLAGSHIP INTELLIGENCE DEMO"
Write-Host "==================================================`n"

# 1. Risk Analysis
Write-Host "1. LIFESTYLE RISK ANALYZER"
Write-Host "   Analyzing burnout, financial, and health risks..."
try {
    $risk = Invoke-RestMethod -Uri "http://localhost:8000/risk/analysis" -Method Get
    Write-Host "`n   Overall Risk Score: $($risk.overall_risk_score)/100"
    
    Write-Host "`n   [BURNOUT]"
    Write-Host "     Score: $($risk.risks.burnout.score)"
    Write-Host "     Prediction: $($risk.risks.burnout.prediction)"
    
    Write-Host "`n   [FINANCIAL]"
    Write-Host "     Score: $($risk.risks.financial.score)"
    Write-Host "     Prediction: $($risk.risks.financial.prediction)"
} catch {
    Write-Host "   Error connecting to Risk Engine: $_"
}

# 2. Memory Fusion
Write-Host "`n--------------------------------------------------"
Write-Host "2. MEMORY FUSION ENGINE"
Write-Host "   Aggregating cross-domain data (Finance + Diet + Mood)..."
try {
    $fusion = Invoke-RestMethod -Uri "http://localhost:8000/memory-fusion/analyze" -Method Get
    
    if ($fusion.insights) {
        foreach ($insight in $fusion.insights) {
            Write-Host "`n   [INSIGHT: $($insight.type.ToUpper())]"
            Write-Host "     Link: $($insight.domain_a) <--> $($insight.domain_b)"
            Write-Host "     Analysis: $($insight.description)"
            Write-Host "     Action: $($insight.action)"
        }
    } else {
        Write-Host "`n   No patterns detected yet."
    }
} catch {
    Write-Host "   Error connecting to Memory Fusion Engine: $_"
}

Write-Host "`n=================================================="
Write-Host " DEMO COMPLETE"
Write-Host "=================================================="
