import { Chart } from 'chart.js';

/**
 * This function will be called after bootstrapping
 * of the app to register a plugin and to extend all the
 * prototypes to support color changes.
 *
 *
 * For applying tooltips permanently set
 * chart.options.showAllTooltips = true;
 */
export function initChartJS() {
    /**
     * beforeRend and afterDraw are like lifecycle
     * They work lifeCycle are called throughtout the
     * formation of chart.js graph
     */
    Chart.pluginService.register({
        /**
         * Runs after the chart has been drawn
         * In here screen/media query is made and the tooltips are
         * turned on and drawn
         */
        afterDraw(chart, easing) {
            if (chart.config.options['showAllTooltips'] && window.matchMedia("(min-width: 500px)").matches) {
              	// create an array of tooltips
                // we can't use the chart tooltip because there is only one tooltip per chart
                chart['pluginTooltips'] = [];
                chart.config.data.datasets.forEach(function (dataset, i) {
                    chart.getDatasetMeta(i).data.forEach(function (sector, j) {
                        chart['pluginTooltips'].push(new (Chart as any).Tooltip({
                            _chart: chart['chart'],
                            _chartInstance: chart,
                            _data: chart.data,
                            _options: chart['options'].tooltips,
                            _active: [sector]
                        }, chart));
                    });
                });

                // turn off normal tooltips 
                chart.options.tooltips.enabled = false;
                // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
                if (!chart['allTooltipsOnce']) {
                    if (easing as any !== 1){
                        return;
                    }
                    chart['allTooltipsOnce']= true;
                }

                // turn on tooltips
                chart.options.tooltips.enabled = true;
                Chart.helpers.each(chart['pluginTooltips'], function (tooltip) {
                    tooltip.initialize();
                    tooltip.update();
                    // we don't actually need this since we are not animating tooltips
                    tooltip.pivot();
                    tooltip.transition(easing).draw();
                });
                chart.options.tooltips.enabled = false;
            }
        }
    })

    /**
     * Get a list of all the controllers
     * and applyBackgroundColor
     */
    const chartList = Object.keys(Chart.controllers);
    for(const chart of chartList) {
        applyBackgroundColor(Chart.controllers[chart].prototype, Chart.controllers[chart].prototype.draw);
    }

    /**s
     * To apply background color set;
     *
     * chart.options.bApplyBackgroundColor = true;
     * if it is set and yHighlightRanges is not present then:
     *
     * default background color will be applied from 0 to ymax ('rgba(46,139,87, 0.1)') and
     * ymin to 0 ('rgba(255, 0, 0, 0.1)')
     *
     * The default format of making a yHighlightRanges array is
     * yHighlightRanges = [{
     *                       begin: 0,
     *                       end: 100,
     *                       color: 'rgba(46,139,87, 0.1)'
     *                   }, {
     *                       begin: -100,
     *                       end: 0,
     *                       color: 'rgba(255, 0, 0, 0.1)'
     *                   }]
     *
     * @param chartPrototype chart controller prototype
     * @param drawObject chart controller draw function from the prototype
     */
    function applyBackgroundColor(chartPrototype, drawObject) {
        Chart.helpers.extend(chartPrototype, {
            draw() {
                const chart = this.chart;
                const ctx = chart.chart.ctx;
                ctx.save();
                if (chart.options.bApplyBackgroundColor) {

                    let yHighlightRanges = [];

                    const xaxis = chart.scales['x-axis-0'];
                    const yaxis = chart.scales['y-axis-0'];

                    if (!chart.options.yHighlightRanges) {
                        const ymin = chart.scales['y-axis-0'].min;
                        const ymax = chart.scales['y-axis-0'].max;
                        yHighlightRanges = [{
                            begin: 0,
                            end: ymax,
                            color: 'rgba(46,139,87, 0.1)'
                        }, {
                            begin: ymin,
                            end: 0,
                            color: 'rgba(255, 0, 0, 0.1)'
                        }]

                    } else {
                        yHighlightRanges = Object.assign({}, chart['options'].yHighlightRanges);
                    }
                    for(const yHighlightRange of yHighlightRanges) {

                        const yRangeBegin = yHighlightRange.begin;
                        const yRangeEnd = yHighlightRange.end;

                        const yRangeBeginPixel = yaxis.getPixelForValue(yRangeBegin);
                        const yRangeEndPixel = yaxis.getPixelForValue(yRangeEnd);

                        // The fill style of the rectangle we are about to fill.
                        ctx.fillStyle = yHighlightRange.color;

                        // Fill the rectangle that represents the highlight region. The parameters are the closest-to-starting-point pixel's x-coordinate,
                        // the closest-to-starting-point pixel's y-coordinate, the width of the rectangle in pixels, and the height of the rectangle in pixels, respectively.
                        ctx.fillRect(xaxis.left, Math.min(yRangeBeginPixel, yRangeEndPixel), xaxis.right - xaxis.left, 
                            Math.max(yRangeBeginPixel, yRangeEndPixel) - Math.min(yRangeBeginPixel, yRangeEndPixel));

                    }

                }
                ctx.restore();

                // Apply the original draw function for the chart.
                drawObject.apply(this, arguments);
            }
        });

    }

}
