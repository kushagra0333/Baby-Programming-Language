cmake_minimum_required(VERSION 3.20.3) # min version required to run the compiler

project(Cook) # name of the project

set(CMAKE_CXX_STANDARD 20) # set the C++ standard to use

add_executable(cook src/main.cpp) # create executable from source
