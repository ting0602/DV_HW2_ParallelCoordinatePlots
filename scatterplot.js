// load iris.csv
d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv").then(function(data) {
    // init setting
    const svg = d3.select("#plot")
        .attr("width", 800)
        .attr("height", 700);
    const margin = { top: 50, right: 50, bottom: 50, left: 100 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    dimensions = data.columns.filter(d => d !== 'class');

    // initialize the options
    document.getElementById("order1").value = "sepal length";
    document.getElementById("order2").value = "sepal width";
    document.getElementById("order3").value = "petal length";
    document.getElementById("order4").value = "petal width";

    // monitor the submit button
    d3.select("#option-box").on("click", function() {
        console.log("click!")
        let s1 = document.getElementById("order1").value;
        let s2 = document.getElementById("order2").value;
        let s3 = document.getElementById("order3").value;
        let s4 = document.getElementById("order4").value;
        update_data = {s1, s2, s3, s4};
        updateYAxis(update_data);
    });

    // create scales for each dimension
    scales = dimensions.map(dim => {
        return d3.scaleLinear()
            .domain(d3.extent(data, d => +d[dim]))
            .range([height, 0]); // reverse
    });

    // create axes
    const axes = dimensions.map((dim, i) => {
        return {
            dim,
            scale: scales[i],
            orient: 'left',
        };
    });

    // add axes
    svg.selectAll('.axis')
        .data(axes)
        .enter().append('g')
        .attr('class', 'axis')
        .attr('transform', (d, i) => `translate(${(i+1) * (width / dimensions.length)}, 0)`)
        .each(function(d) { d3.select(this).call(d3.axisLeft(d.scale)); })

    // add labels
    svg.selectAll('.axis-label')
        .data(dimensions)
        .enter().append('text')
        .attr('class', 'axis-label')
        .attr('x', (d, i) => (i) * (width / dimensions.length) + (width / dimensions.length))
        .attr('y', height + margin.bottom - 5)
        .text(d => d)
        .style('text-anchor', 'middle');

    // render the lines for each data
    svg.selectAll('.line')
        .data(data)
        .enter().append('path')
        .attr('class', 'line')
        .attr('d', d => {
            return d3.line()(dimensions.map((dim, i) => [(i+1) * (width / dimensions.length), scales[i](+d[dim])]));
        })
        .style('stroke', d => {
            if (d.class === 'Iris-setosa') return 'red';
            if (d.class === 'Iris-versicolor') return 'green';
            if (d.class === 'Iris-virginica') return 'blue';
        })
        .on("mouseover", handleMouseOver) // show up the data info
        .on("mouseout", handleMouseOut); // fade away

        
    function updateYAxis(update_data) {
        // update dimensions
        dimensions = Object.values(update_data);

        // update scales
        scales = dimensions.map(dim => {
            return d3.scaleLinear()
                .domain(d3.extent(data, d => +d[dim]))
                .range([height, 0]); // reverse
        });
    
        // update axis
        svg.selectAll('.axis')
            .data(axes)
            .transition()
            .duration(1000)
            .each(function(d, i) {
                d.dim = dimensions[i];
                d.scale = scales[i];
                d3.select(this).call(d3.axisLeft(d.scale));
            });

        // update label
        svg.selectAll('.axis-label')
            .data(dimensions)
            .text(d => d);
    
        // update lines
        svg.selectAll('.line')
            .transition()
            .duration(1000)
            .attr('d', d => {
                return d3.line()(dimensions.map((dim, i) => [(i+1) * (width / dimensions.length), scales[i](+d[dim])]));
            });
    }
    
});

// Additional Functions
// MouseOver => show info
function handleMouseOver(event, d) {
    // get info
    const sepalLength = d['sepal length'];
    const sepalWidth = d['sepal width'];
    const petalLength = d['petal length'];
    const petalWidth = d['petal width'];
    const flowerClass = d['class'];

    // create info box
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("opacity", 0.9);

    // info box HTML
    tooltip.html(`
        <p>Sepal Length: ${sepalLength}</p>
        <p>Sepal Width: ${sepalWidth}</p>
        <p>Petal Length: ${petalLength}</p>
        <p>Petal Width: ${petalWidth}</p>
        <p>Class: ${flowerClass}</p>
    `);

    // info box CSS
    tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
}

// MouseOut => fade away
function handleMouseOut() {
    d3.select(".tooltip").remove();
}