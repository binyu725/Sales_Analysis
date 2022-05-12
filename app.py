from flask import Flask, render_template, request
import pandas as pd
import json

app = Flask(__name__)

def process_data():
    data = pd.read_csv("sales_data.csv")
    data = data.drop(['POSTALCODE', 'STATE', 'ORDERNUMBER', 'PHONE', 'ADDRESSLINE1', 'ADDRESSLINE2', 'CONTACTLASTNAME', 'CONTACTFIRSTNAME'], axis=1)
    data['time_period'] = data['YEAR_ID'].map(str) + "q" + data['QTR_ID'].map(str)
    data['COUNTRY'] = data['COUNTRY'].replace({'UK': 'England'}, regex=True)
    return data

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/barchart', methods=['GET', 'POST'])
def barchart():
    transferred_data = data.copy()
    if request.method == 'POST':
        if "country_name" in request.form:
            country = request.form['country_name']
            transferred_data = transferred_data.loc[transferred_data['COUNTRY'] == country]
        if "time_period" in request.form:
            time_period = request.form['time_period']
            transferred_data = transferred_data.loc[transferred_data['time_period'] == time_period]
        if "product" in request.form:
            product = request.form['product']
            transferred_data = transferred_data.loc[transferred_data['PRODUCTLINE'] == product]
        if "customer_name" in request.form:
            customer = request.form['customer_name']
            transferred_data = transferred_data.loc[transferred_data['CUSTOMERNAME'] == customer]
    transferred_data = transferred_data[["CUSTOMERNAME", "SALES"]].groupby(by=["CUSTOMERNAME"]).sum().sort_values(by='SALES', ascending=False).head(10)
    transferred_data.reset_index(inplace=True)
    transferred_data = {'data': transferred_data.to_dict('records')}
    return json.dumps(transferred_data)

@app.route('/geomap', methods=['GET', 'POST'])
def geomap():
    transferred_data = data.copy()
    if request.method == 'POST':
        if "country_name" in request.form:
            country = request.form['country_name']
            transferred_data = transferred_data.loc[transferred_data['COUNTRY'] == country]
        if "time_period" in request.form:
            time_period = request.form['time_period']
            transferred_data = transferred_data.loc[transferred_data['time_period'] == time_period]
        if "customer_name" in request.form:
            customer = request.form['customer_name']
            transferred_data = transferred_data.loc[transferred_data['CUSTOMERNAME'] == customer]
        if "product" in request.form:
            product = request.form['product']
            transferred_data = transferred_data.loc[transferred_data['PRODUCTLINE'] == product]
    transferred_data = {'data': transferred_data[["COUNTRY", "SALES"]].groupby(by=["COUNTRY"]).sum().to_dict('index')}
    return json.dumps(transferred_data)

@app.route('/stackedBarchart', methods=['GET', 'POST'])
def stackedBarchart():
    transferred_data = data.copy()
    if request.method == 'POST':
        if "country_name" in request.form:
            country = request.form['country_name']
            transferred_data = transferred_data.loc[transferred_data['COUNTRY'] == country]
        if "customer_name" in request.form:
            customer = request.form['customer_name']
            transferred_data = transferred_data.loc[transferred_data['CUSTOMERNAME'] == customer]
        if "time_period" in request.form:
            time_period = request.form['time_period']
            transferred_data = transferred_data.loc[transferred_data['time_period'] == time_period]
        if "product" in request.form:
            product = request.form['product']
            transferred_data = transferred_data.loc[transferred_data['PRODUCTLINE'] == product]
    transferred_data = transferred_data[["time_period", "SALES", "PRODUCTLINE"]]
    # transferred_data["MONTH_ID"] = transferred_data.MONTH_ID.map("{:02}".format)
    # transferred_data["time_period"] = transferred_data["YEAR_ID"].astype(str) + "-" + transferred_data[
    #     "MONTH_ID"].astype(str)
    transferred_data = transferred_data.groupby(["time_period", "PRODUCTLINE"]).sum()
    transferred_data.index.name = 'timeline'
    transferred_data.reset_index(inplace=True)
    transferred_data = transferred_data.set_index(['time_period', 'PRODUCTLINE']).SALES.unstack()
    transferred_data = transferred_data.fillna(0)
    transferred_data.index.name = 'time_period'
    transferred_data.reset_index(inplace=True)
    return json.dumps(transferred_data.to_dict('records'))

@app.route('/stackedAreaChart', methods=['GET', 'POST'])
def stackedAreaChart():
    transferred_data = data.copy()
    if request.method == 'POST':
        if "country_name" in request.form:
            country = request.form['country_name']
            transferred_data = transferred_data.loc[transferred_data['COUNTRY'] == country]
        if "customer_name" in request.form:
            customer = request.form['customer_name']
            transferred_data = transferred_data.loc[transferred_data['CUSTOMERNAME'] == customer]
        if "time_period" in request.form:
            time_period = request.form['time_period']
            transferred_data = transferred_data.loc[transferred_data['time_period'] == time_period]
        if "product" in request.form:
            product = request.form['product']
            transferred_data = transferred_data.loc[transferred_data['PRODUCTLINE'] == product]
    transferred_data = transferred_data[["SALES", "ORDERDATE", "PRODUCTLINE"]]
    transferred_data["ORDERDATE"] = transferred_data["ORDERDATE"].str[:-5]
    transferred_data = transferred_data.groupby(["ORDERDATE", "PRODUCTLINE"]).sum()
    transferred_data.index.name = 'timeline'
    transferred_data.reset_index(inplace=True)
    transferred_data = transferred_data.set_index(['ORDERDATE', 'PRODUCTLINE']).SALES.unstack()
    transferred_data = transferred_data.fillna(0)
    transferred_data.index.name = 'date'
    transferred_data.reset_index(inplace=True)
    transferred_data["date"] = pd.to_datetime(transferred_data.date, format='%m-%d-%Y', infer_datetime_format=True).astype(str)
    transferred_data = transferred_data.sort_values(by=['date'], ascending=True)
    transferred_data.loc[:, transferred_data.columns != 'date'] = transferred_data.loc[:, transferred_data.columns != 'date'].cumsum()
    return json.dumps(transferred_data.to_dict('records'))

@app.route('/pcp')
def pcp():
    transferred_data = data[["QUANTITYORDERED", "SALES", "PRICEEACH", "STATUS", "PRODUCTLINE", "COUNTRY", "DEALSIZE"]]
    data_values = transferred_data.to_dict('records')
    data_dimension = transferred_data.columns.values.tolist()
    transferred_data = {'dimensions': data_dimension, 'data_values': data_values}
    return json.dumps(transferred_data)

@app.route('/growthRate', methods=['GET', 'POST'])
def growthRate():
    transferred_data = data.copy()
    if request.method == 'POST':
        if "country_name" in request.form:
            country = request.form['country_name']
            transferred_data = transferred_data.loc[transferred_data['COUNTRY'] == country]
    transferred_data['YEAR_MONTH'] = transferred_data['YEAR_ID'].map(str) + transferred_data['MONTH_ID'].map(str).map(lambda x: x.rjust(2, '0'))

    transferred_data = transferred_data.groupby('CUSTOMERNAME').YEAR_MONTH.min().reset_index()
    transferred_data.columns = ['CUSTOMERNAME', 'FirstPurchaseDate']
    transferred_data = transferred_data.groupby(['FirstPurchaseDate'])['CUSTOMERNAME'].nunique().pct_change()
    transferred_data = transferred_data.fillna(0)
    return json.dumps(transferred_data.to_dict())

@app.route('/salesGrowthRate', methods=['GET', 'POST'])
def salesGrowthRate():
    transferred_data = data.copy()
    if request.method == 'POST':
        if "country_name" in request.form:
            country = request.form['country_name']
            transferred_data = transferred_data.loc[transferred_data['COUNTRY'] == country]
        if "product" in request.form:
            product = request.form['product']
            transferred_data = transferred_data.loc[transferred_data['PRODUCTLINE'] == product]
    # transferred_data['YEAR_MONTH'] = transferred_data['YEAR_ID'].map(str) + transferred_data['MONTH_ID'].map(str).map(lambda x: x.rjust(2, '0'))
    transferred_data = transferred_data.groupby('time_period')['SALES'].sum().reset_index()
    transferred_data['MONTHLYGROWTH'] = transferred_data['SALES'].pct_change()
    transferred_data = transferred_data.fillna(0)
    transferred_data = transferred_data.drop(['SALES'], axis=1)
    return json.dumps(transferred_data.to_dict('records'))


if __name__ == '__main__':
    data = process_data()
    app.run()