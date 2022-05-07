from flask import Flask, render_template, request
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import json

app = Flask(__name__)

def process_data():
    data = pd.read_csv("sales_data.csv")
    data = data.drop(['POSTALCODE', 'STATE', 'ORDERNUMBER', 'PHONE', 'ADDRESSLINE1', 'ADDRESSLINE2', 'CONTACTLASTNAME', 'CONTACTFIRSTNAME'], axis=1)
    return data

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/barchart')
def barchart():
    # transferred_data = {'data': data.to_dict('records')}

    transferred_data = data[["CUSTOMERNAME", "SALES"]].groupby(by=["CUSTOMERNAME"]).sum().sort_values(by='SALES', ascending=False).head(10)
    transferred_data.reset_index(inplace=True)
    transferred_data = {'data': transferred_data.to_dict('records')}
    return json.dumps(transferred_data)

@app.route('/geomap')
def geomap():
    transferred_data = {'data': data[["COUNTRY", "SALES"]].groupby(by=["COUNTRY"]).sum().to_dict('index')}
    return json.dumps(transferred_data)

@app.route('/stackedBarchart', methods=['GET', 'POST'])
def stackedBarchart():
    transferred_data = data.copy()
    if request.method == 'POST':
        country = request.form['country_name']
        transferred_data = transferred_data.loc[transferred_data['COUNTRY'] == country]
    transferred_data = transferred_data[["QUANTITYORDERED", "QTR_ID", "YEAR_ID", "PRODUCTLINE"]]
    transferred_data['time_period'] = data['YEAR_ID'].map(str) + "q" + data['QTR_ID'].map(str)
    # transferred_data["MONTH_ID"] = transferred_data.MONTH_ID.map("{:02}".format)
    # transferred_data["time_period"] = transferred_data["YEAR_ID"].astype(str) + "-" + transferred_data[
    #     "MONTH_ID"].astype(str)
    transferred_data.drop(["QTR_ID", "YEAR_ID"], axis=1)
    transferred_data = transferred_data.groupby(["time_period", "PRODUCTLINE"]).sum()
    transferred_data.index.name = 'timeline'
    transferred_data.reset_index(inplace=True)
    transferred_data = transferred_data.set_index(['time_period', 'PRODUCTLINE']).QUANTITYORDERED.unstack()
    transferred_data = transferred_data.fillna(0)
    transferred_data.index.name = 'time_period'
    transferred_data.reset_index(inplace=True)
    return json.dumps(transferred_data.to_dict('records'))

@app.route('/stackedAreaChart')
def stackedAreaChart():
    transferred_data = data[["SALES", "ORDERDATE", "PRODUCTLINE"]]
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

@app.route('/pca')
def pca():
    # transferred_data = data.copy()
    # transferred_data = transferred_data.drop(["STATUS", "ORDERDATE", "PRODUCTLINE", "PRODUCTCODE", "CITY", "COUNTRY", "TERRITORY", "DEALSIZE"], axis=1)

    transferred_data = data.select_dtypes(['number'])

    transferred_data = StandardScaler().fit_transform(transferred_data)

    pca = PCA(n_components=3)
    projection = pca.fit_transform(transferred_data)

    kmeans_pca = KMeans(n_clusters=4).fit(projection)

    # sns.scatterplot(df_segm_pca_kmeans["SALES"], df_segm_pca_kmeans["QUANTITYORDERED"], hue=df_segm_pca_kmeans["segment kmeans pca"], palette=['g', 'r', 'c', 'm'])
    # plt.show()

    return json.dumps({'data': projection.tolist(), 'label': kmeans_pca.labels_.tolist()})

@app.route('/pcp')
def pcp():
    transferred_data = data[["QUANTITYORDERED", "PRICEEACH", "SALES", "STATUS", "PRODUCTLINE", "COUNTRY", "DEALSIZE", "QTR_ID"]]
    data_values = transferred_data.to_dict('records')
    data_dimension = transferred_data.columns.values.tolist()
    transferred_data = {'dimensions': data_dimension, 'data_values': data_values}
    return json.dumps(transferred_data)

@app.route('/growthRate')
def growthRate():
    data['YEAR_MONTH'] = data['YEAR_ID'].map(str) + data['MONTH_ID'].map(str).map(lambda x: x.rjust(2, '0'))
    df_first_purchase = data.groupby('CUSTOMERNAME').YEAR_MONTH.min().reset_index()
    df_first_purchase.columns = ['CUSTOMERNAME', 'FirstPurchaseDate']

    transferred_data = df_first_purchase.groupby(['FirstPurchaseDate'])['CUSTOMERNAME'].nunique().pct_change()
    transferred_data = transferred_data.fillna(0)
    return json.dumps(transferred_data)


if __name__ == '__main__':
    data = process_data()
    app.run()