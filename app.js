const budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalInc) {

        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            // [1 2 3 4 5 6 7 8], next id = 9
            // [1 4 5 6 8], next id = 9
            // ID = lastID +1
            //lastID = length - 1 (length is always 1 more than array elements)

            // create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // create new item based on types
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            };
            // push newly created item into all.Items[inc or exp]
            data.allItems[type].push(newItem);

            // return newly created entry
            return newItem;

        },

        deleteItem: function (type, id) {
            var index, ids;
            // Since each entry to Expense and Income are OBJ (id, des, value)

            // data.allItems[type][id] woudln't work since elements aren't ordered

            // Create a new array containg all entries' id number
            ids = data.allItems[type].map(function (current) {
                // Returns entry's id
                return current.id
            });
            // Search for index number of the id passed into argurment
            index = ids.indexOf(id);

            if (index !== -1) {
                //Delete the index splice(index, amount of index that will be deleted)
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function () {

            // calculate total of income and expense
            calculateTotal("exp");
            calculateTotal("inc");
            // calculate budget income - expense
            data.budget = data.totals.inc - data.totals.exp
            // calculate percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100)
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPer = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });

            return allPer
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },
        testing: function () {
            console.log(data)
        }
    };

})();

const UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputValue: ".add__value",
        inputDesc: ".add__description",
        inputBtn: ".add__btn",

        inclList: document.querySelector(".income__list"),
        expList: document.querySelector(".expenses__list"),

        budgetValue: document.querySelector(".budget__value"),
        budgetInc: document.querySelector(".budget__income--value"),
        budgetExp: document.querySelector(".budget__expenses--value"),
        budgetPer: document.querySelector(".budget__expenses--percentage"),

        container: document.querySelector(".container"),

        expPerLabel: ".item__percentage",

        dateLabel: ".budget__title--month"
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        };
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec, sign;
        num = Math.abs(num);


        // (2.3456).toFIxed(2) => "2.46"  String
        num = num.toFixed(2);
        // Splitting number into decimal 2 and interger 46
        numSplit = num.split(".")

        int = numSplit[0];
        // number.length returns amount of numbers
        if (int.length > 3) {
            // substr(starting index, how many numbers)
            // 1234.substr(1,2) => 23
            // number 12345
            // 12345.subtr(0,5-3) => 12 + ","
            // 12345.substr(5-3, 5) => 345

            // 1234567.substr(0, 7-3) => 1234
            // 1234567.(7-3, 3) => 567
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3)
        }
        dec = numSplit[1];

        if (type === "exp") {
            sign = "-"
        } else if (type === "inc") {
            sign = "+"
        }
        return sign + " " + int + "." + dec;
    };


    return {

        getInput: function () {

            return {
                // get input of HTML elements| value

                type: document.querySelector(DOMstrings.inputType).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                des: document.querySelector(DOMstrings.inputDesc).value,
            };
        },
        addListItem: function (obj, type) {
            var html, element, newHtml;

            // create html string with placeholder text 
            if (type === "inc") {

                // Location of the added element
                element = DOMstrings.inclList;
                // %% are used to highlight strings that will be replaced, otherwise they have no function     
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === "exp") {
                element = DOMstrings.expList;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            };

            // replace placeholder text with data from new Expense or Income property
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            // insert html into DOM

            element.insertAdjacentHTML("beforeend", newHtml)


        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            // Since JS only has remove child, a way around is to use parentNode then removeChild
            // inc/exp-id is passed as argurment 
            el.parentNode.removeChild(el);


        },

        getDOMstrings: function () {

            return DOMstrings;
        },

        clearFields: function () {
            var field, fieldArr;
            // Select all html elements with CSS class of description and value
            field = document.querySelectorAll(DOMstrings.inputDesc + ", " + DOMstrings.inputValue);

            // Since field is not an array, using below method create a new variable with value set to a array converted FIELD
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(function (current, index, arr) {
                current.value = "";
            })
            // Move the typing icon back to description
            fieldArr[0].focus();
        },

        displayBudget: function (obj) {
            if (obj.budget > 0) {
                type = "inc"
            } else {
                type = "exp"
            };

            DOMstrings.budgetValue.textContent = formatNumber(obj.budget, type);
            DOMstrings.budgetInc.textContent = formatNumber(obj.totalInc, "inc");
            DOMstrings.budgetExp.textContent = formatNumber(obj.totalExp, "exp");
            DOMstrings.budgetPer.textContent = obj.percentage;

            if (obj.percentage > 0) {
                DOMstrings.budgetPer.textContent = obj.percentage + "%";
            } else {
                DOMstrings.budgetPer.textContent = "---";
            }


        },


        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expPerLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";

                } else {
                    current.textContent = "---";
                }
            });


        },

        displayMonth: function () {

            var now, year, months, month;

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            month = months[month]
            document.querySelector(DOMstrings.dateLabel).textContent = month + " of " + year


        },

        changedType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.inputDesc + "," +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle("red-focus")
            });
            /*     document.querySelector(DOMstrings.inputType).classList.toggle("red-focus")
                 document.querySelector(DOMstrings.inputDesc).classList.toggle("red-focus")
                 document.querySelector(DOMstrings.inputValue).classList.toggle("red-focus")
                 
                 document.querySelector(DOMstrings.inputBtn).classList.toggle("red")
                 */
        }



    };


})();


const controller = (function (budgetCtrl, UICtrl) {

    var setupEvenListener = function () {

        var DOM = UICtrl.getDOMstrings()


        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {

            if (event.keyCode === 13 || event.which === 13) {

                ctrlAddItem();
            }


        });

        DOM.container.addEventListener("click", ctrlDeleteItem);



        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);


    };

    var updateBudget = function () {
        // 1. calculate budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. update budget on UI
        UICtrl.displayBudget(budget)

    };

    var updatePercentage = function () {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages()

        // 2. Read 
        var percentages = budgetCtrl.getPercentages();
        // 3. Update UI
        UICtrl.displayPercentages(percentages)
    };


    var ctrlAddItem = function () {
        // 1. Get input data
        var input = UICtrl.getInput();

        if (input.des !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add item to budget controller
            var newItem = budgetCtrl.addItem(input.type, input.des, input.value)
            // 3. Add item to UI, in this case the newItem object
            UICtrl.addListItem(newItem, input.type)

            // 4. Empty the field
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Update percentage

            updatePercentage();

        };


    };

    var ctrlDeleteItem = function () {
        var itemID, ID, type;
        // Event.target return HTML clicked
        // When clicking delete button, it returns <i> element wrapped inside Income container
        // .id is to get id="income-1"
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;


        if (itemID) {
            // Right now html block is id="exp/inc-IDnumber"
            // Splitted at - with turns into array splitID = ["exp/ince", "IDnumber"]
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete item from data structure. passing in ID targetted by click
            budgetCtrl.deleteItem(type, ID)
            // 2. delete item from UI, passing in inc/exp-id
            UICtrl.deleteListItem(itemID)
            // 3. update new budget
            updateBudget();
            // 6. Update percentage

            updatePercentage();

        }
    };
    return {
        init: function () {
            console.log('Appliction has been started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            })

            setupEvenListener();
        }
    }

})(budgetController, UIController);

controller.init();