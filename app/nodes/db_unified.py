import os
from typing import Dict, Any, List, Optional, Union
from app.models.state import State
import psycopg2
import mysql.connector
from pymongo import MongoClient
from pymongo.errors import PyMongoError

class DatabaseNode:
    """Unified database node supporting multiple database types"""
    
    @staticmethod
    def execute(
        state: State,
        query: str,
        db_type: str = "postgresql",
        operation: str = "select",
        params: Optional[Dict[str, Any]] = None,
        collection: Optional[str] = None
    ) -> State:
        
        # Get connection config from state
        db_config = state["api_keys"].get(db_type, {})
        
        try:
            if db_type in ["postgresql", "mysql"]:
                result = DatabaseNode._execute_sql(
                    db_type=db_type,
                    db_config=db_config,
                    query=query,
                    operation=operation,
                    params=params or {}
                )
            elif db_type == "mongodb":
                result = DatabaseNode._execute_mongo(
                    db_config=db_config,
                    query=query,
                    operation=operation,
                    collection=collection,
                    params=params or {}
                )
            else:
                raise ValueError(f"Unsupported database type: {db_type}")
            
            state["current_output"] = result
            state["db_metadata"] = {
                "db_type": db_type,
                "rows_affected": result.get("rows_affected", len(result.get("data", []))),
                "operation": operation
            }
            
        except Exception as e:
            state["error"] = f"Database error: {str(e)}"
            raise
        
        return state
    
    @staticmethod
    def _execute_sql(db_type: str, db_config: Dict, query: str, operation: str, params: Dict) -> Dict:
        """Execute SQL query"""
        conn = None
        try:
            if db_type == "postgresql":
                conn = psycopg2.connect(**db_config)
            elif db_type == "mysql":
                conn = mysql.connector.connect(**db_config)
            
            cursor = conn.cursor()
            cursor.execute(query, params)
            
            if operation == "select":
                columns = [desc[0] for desc in cursor.description]
                data = cursor.fetchall()
                return {"columns": columns, "data": data}
            else:
                conn.commit()
                return {"rows_affected": cursor.rowcount}
                
        finally:
            if conn:
                conn.close()
    
    @staticmethod
    def _execute_mongo(db_config: Dict, query: Dict, operation: str, collection: str, params: Dict) -> Dict:
        """Execute MongoDB operation"""
        try:
            client = MongoClient(db_config["connection_string"])
            db = client[db_config["database"]]
            col = db[collection]
            
            if operation == "select":
                if isinstance(query, str):
                    query = eval(query)  # Converts string to dict
                return list(col.find(query, **params))
            elif operation == "insert":
                return {"inserted_ids": col.insert_many(query).inserted_ids}
            elif operation == "update":
                return {"modified_count": col.update_many(query["filter"], query["update"]).modified_count}
            elif operation == "delete":
                return {"deleted_count": col.delete_many(query).deleted_count}
                
        except PyMongoError as e:
            raise ValueError(f"MongoDB error: {str(e)}")