export interface SideNavMenu {
    id: string;
    label: string;
    route: string;
}

export const maintenanceFareMenu: SideNavMenu[] = [
    {
        id: 'application-upgrade',
        label: 'APPLICATION_UPGRADE',
        route: '/application-upgrade',
    },
    {
        id: 'view-parameter',
        label: 'VIEW_PARAMETER',
        route: '/view-parameter',
    },
    {
        id: 'fare-console',
        label: 'CONFIGURE_FARE_CONSOLE',
        route: '/fare-console',
    },
    // {
    //     id: 'calibrate-bls',
    //     label: 'CALIBRATE_BLS',
    //     route: '/calibrate-bls',
    // },
    {
        id: 'version-info',
        label: 'VERSION_INFO',
        route: '/version-info',
    },
    {
        id: 'bls-information',
        label: 'BLS_INFORMATION',
        route: '/bls-information',
    },
    // {
    //     id: 'reset-bls',
    //     label: 'RESET_BLS',
    //     route: '/reset-bls',
    // },
    // {
    //     id: 'test-print',
    //     label: 'CHECK_TEST_PRINTER',
    //     route: '/test-print',
    // },
    // {
    //     id: 'check-printer',
    //     label: 'Check Printer',
    //     route: '/check-printer',
    // },
    // {
    //     id: 'gyro-switch',
    //     label: "GYRO_SWITCH",
    //     route: '/gyro-switch',
    // },
    // {
    //     id: 'redetect-crp',
    //     label: 'REDETECT_CRP',
    //     route: '/redetect-crp',
    // },
    {
        id: 'redetect-cv',
        label: 'REDETECT_CV',
        route: '/redetect-cv',
    },
    // {
    //     id: 'redetect-fms',
    //     label: 'REDETECT_FMS',
    //     route: '/redetect-fms',
    // },
    // {
    //     id: 'redetect-bls',
    //     label: 'REDETECT_BLS',
    //     route: '/redetect-bls',
    // },
    {
        id: 'load-parameter',
        label: 'LOAD_PARAMETERS',
        route: '/load-parameter',
    },
    {
        id: 'save-transaction',
        label: 'SAVE_TRANSACTION',
        route: '/save-transaction',
    },
    // {
    //     id: 'resend-cv-key',
    //     label: 'RESEND_CV_KEY',
    //     route: '/resend-cv-key',
    // },
    // {
    //     id: 'print-bcv-result',
    //     label: 'PRINT_CV_RESULTS',
    //     route: '/print-bcv-result',
    // },
    {
        id: 'display-audit',
        label: 'DISPLAY_AUDIT',
        route: '/display-audit',
    },
    {
        id: 'external-devices',
        label: 'EXTERNAL_DEVICES',
        route: '/external-devices',
    },
    {
        id: 'setting',
        label: 'SETTINGS',
        route: '/setting',
    },
    {
        id: 'decommission',
        label: 'DECOMMISSION',
        route: '/decommission',
    },
    // {
    //     id: 'change-wlan-key',
    //     label: 'CHANGE_WLAN_KEY',
    //     route: '/change-wlan-key',
    // },
];

export const deviceOperationMenu: SideNavMenu[] = [
    {
        id: 'device-operation/cv',
        label: 'CV Operations',
        route: '/device-operation/cv',
    },
    {
        id: 'device-operation/bls',
        label: 'BLS Operations',
        route: '/device-operation/bls',
    },
    {
        id: 'device-operation/printer',
        label: 'Printer Operations',
        route: '/device-operation/printer',
    },
];
