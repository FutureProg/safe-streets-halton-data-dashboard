import {getStoryContext, type TestRunnerConfig } from '@storybook/test-runner';
import {injectAxe, checkA11y, configureAxe} from 'axe-playwright';

const config: TestRunnerConfig = {
    async preVisit(page) {
        await injectAxe(page);
    },
    async postVisit(page, context) {
        const storyContext = await getStoryContext(page, context);

        if (storyContext.parameters?.ally?.disable) {
            return;
        }

        await configureAxe(page, {
            rules: storyContext.parameters?.a11y?.config?.rules,
        });

        const element = storyContext.parameters?.a11y?.element || '#storybook-root';

        await checkA11y(page, element, {
            detailedReport: true,
            detailedReportOptions: {
                html: true
            }
        });
    }
}

export default config;