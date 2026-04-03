/* 
 * =================================================================
 * 🛡️ FoE TREASURY MONITOR v3.8 (Universal Edition)
 * © 2026 3lackghost. All rights reserved.
 * 
 * LEGAL NOTICE:
 * This software and its source code are the intellectual property 
 * of the author (3lackghost). Unauthorized redistribution or 
 * modification is prohibited.
 * =================================================================
 */

let TreasuryMonitor = {
    settings: {
        webhookUrl: 'PASTE_YOUR_DISCORD_WEBHOOK_URL_HERE',
        criticalThresholdPercent: 10, 

        eras: {
            "IronAge": 0, "EarlyMiddleAge": 0, "HighMiddleAge": 0, "LateMiddleAge": 0,
            "ColonialAge": 0, "IndustrialAge": 0, "ProgressiveEra": 0, "ModernEra": 0,
            "PostModernEra": 0, "ContemporaryEra": 0, "Tomorrow": 0, "Future": 0,
            "ArcticFuture": 0, "OceanicFuture": 0, "VirtualFuture": 0, "MarsAge": 0,
            "AsteroidBelt": 0, "VenusAge": 0, "JupiterMoon": 0, "Titan": 0, "SpaceHub": 0
        },

        specialGoods: { "algae": 0, "liquid_binder": 0 }
    },

    init: () => {
        console.log("%c🛡️ FoE Universal Monitor v3.8 initialized", "color: #00ff00; font-weight: bold;");
        if (typeof FoEProxy !== 'undefined') {
            FoEProxy.addHandler('GuildInnoService', 'getGuildGoods', (data) => {
                if (data && data.responseData) TreasuryMonitor.processData(data.responseData);
            });
        }
    },

    processData: (guildData) => {
        let reports = {};
        guildData.forEach(item => {
            let limit = TreasuryMonitor.settings.specialGoods[item.good_id] || TreasuryMonitor.settings.eras[item.era] || 0;
            if (limit > 0 && item.value < limit) {
                if (!reports[item.era]) reports[item.era] = { items: [], critical: false };
                let perc = (item.value / limit) * 100;
                if (perc < TreasuryMonitor.settings.criticalThresholdPercent) reports[item.era].critical = true;
                let line = `${perc < 10 ? '🚨' : '🔸'} ${i18n('Goods.' + item.good_id)}: ${item.value.toLocaleString()} / ${limit.toLocaleString()} (${perc.toFixed(1)}%)`;
                reports[item.era].items.push(line);
            }
        });

        for (let era in reports) {
            let eraName = (i18n('Eras.' + era) || era).toUpperCase();
            let payload = {
                embeds: [{
                    title: `🛡️ ${eraName} 🛡️`,
                    description: reports[era].items.join('\n'),
                    color: reports[era].critical ? 15548997 : 15105570,
                    footer: { text: "v3.8 Universal • Developed by 3lackghost" }
                }]
            };
            fetch(TreasuryMonitor.settings.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        }
    }
};

TreasuryMonitor.init();
