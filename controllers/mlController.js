import { trainFNN } from '../ml/trainModel.js';
import { predict } from '../ml/predictDemand.js';
import { buildAdminDashboardData, buildAdminDashboardPayload } from './adminController.js';

const wantsJson = (req) =>
    req.xhr ||
    req.get('x-requested-with') === 'XMLHttpRequest' ||
    req.get('accept')?.includes('application/json');

export const uploadDatasetAndTrain = async (req, res) => {
    try {
        if (!req.file) throw new Error("Please upload a file.");
        await trainFNN(req.file.path);

        if (wantsJson(req)) {
            const dashboard = await buildAdminDashboardPayload();
            return res.json({
                success: true,
                action: 'model-trained',
                message: 'Model successfully trained.',
                dashboard
            });
        }

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        if (wantsJson(req)) {
            const dashboard = await buildAdminDashboardPayload({ error: error.message });
            return res.status(500).json({
                success: false,
                error: error.message,
                dashboard
            });
        }

        res.redirect('/admin/dashboard');
    }
};

export const runPrediction = async (req, res) => {
    const { day, time, itemName, price, avgSales, event } = req.body;
    try {
        const demand = await predict(day, time, itemName, price, event, avgSales);
        const prediction = { item: itemName, demand };
        const viewData = await buildAdminDashboardData();

        if (wantsJson(req)) {
            const dashboard = await buildAdminDashboardPayload({ prediction, error: null });
            return res.json({
                success: true,
                action: 'prediction-generated',
                prediction,
                dashboard
            });
        }

        res.render('admin/dashboard', {
            ...viewData,
            prediction,
            error: null
        });
    } catch (error) {
        const viewData = await buildAdminDashboardData();

        if (wantsJson(req)) {
            const dashboard = await buildAdminDashboardPayload({ prediction: null, error: error.message });
            return res.status(500).json({
                success: false,
                error: error.message,
                dashboard
            });
        }

        res.render('admin/dashboard', {
            ...viewData,
            prediction: null,
            error: error.message
        });
    }
};
