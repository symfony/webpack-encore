// use code splitting via a dynamic import
import('./print_to_app_export').then(printToApp => {
    printToApp.default();
});
